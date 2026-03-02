import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  PAYMENT_GATEWAY,
  PaymentGatewayRepository,
} from '../domain/payment-gateway.repository';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from '../../product/domain/product.repository';
import {
  TRANSACTION_REPOSITORY,
  TransactionRepository,
} from '../domain/transaction.repository';
import {
  DELIVERY_REPOSITORY,
  DeliveryRepository,
} from '../domain/delivery.repository';
import { USER_REPOSITORY, UserRepository } from '../domain/user.repository';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { MerchantResponse } from '../dto/merchant-response.dto';
import { CreateCardTokenDto } from '../dto/create-card-token.dto';
import { CardTokenResponse } from '../dto/card-token-response.dto';
import { CreateTransactionResponse } from '../dto/create-transaction-response.dto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: PaymentGatewayRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepository,
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveryRepository: DeliveryRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async getMerchantInfo(): Promise<MerchantResponse> {
    try {
      return await this.paymentGateway.getMerchantInfo();
    } catch {
      throw new InternalServerErrorException('Error al obtener merchant info');
    }
  }

  async createCardToken(body: CreateCardTokenDto): Promise<CardTokenResponse> {
    try {
      return await this.paymentGateway.createCardToken(body);
    } catch {
      throw new InternalServerErrorException('Error al crear card token');
    }
  }

  async createTransaction(
    body: CreateTransactionDto,
  ): Promise<CreateTransactionResponse> {
    const product = await this.productRepository.findOne(body.product_id);
    if (!product) {
      throw new NotFoundException(
        `Producto con id ${body.product_id} no encontrado`,
      );
    }
    if (product.stock <= 0) {
      throw new BadRequestException('El producto no tiene stock disponible');
    }

    let user = await this.userRepository.findByEmail(body.customer_email);
    if (!user) {
      user = await this.userRepository.create({
        email: body.customer_email,
        name: body.customer_data.full_name,
        phone: body.customer_data.phone_number,
        legalId: body.customer_data.legal_id,
        legalIdType: body.customer_data.legal_id_type,
      });
    }

    const reference = this.paymentGateway.generateReference();
    const signature = this.paymentGateway.generateSignature(
      reference,
      body.amount_in_cents,
      body.currency,
    );

    const localTx = await this.transactionRepository.create({
      productId: product.id,
      userId: user.id,
      reference,
      amountInCents: body.amount_in_cents,
      currency: body.currency,
      status: 'PENDING',
      installments: body.payment_method.installments,
      shippingAddress: body.shipping_info.address,
      shippingCity: body.shipping_info.city,
      shippingDepartment: body.shipping_info.department,
    });

    const { product_id, shipping_info, ...rest } = body;
    const payload = { ...rest, reference, signature };

    try {
      const result = await this.paymentGateway.createTransaction(payload);
      const wompiTxId = result.data.id.toString();
      const wompiStatus = result.data.status;

      await this.transactionRepository.updateStatus(
        localTx.id,
        wompiStatus,
        wompiTxId,
      );

      if (wompiStatus === 'APPROVED') {
        await this.handleSuccessfulPayment(
          localTx.id,
          user.id,
          product.id,
          body.shipping_info.address,
          body.shipping_info.city,
          body.shipping_info.department,
        );
      }

      return result;
    } catch (error) {
      this.logger.error(`Error procesando pago: ${error.message}`, error.stack);
      await this.transactionRepository.updateStatus(localTx.id, 'ERROR');
      throw new InternalServerErrorException(
        'Error al procesar el pago en Wompi',
      );
    }
  }

  private async handleSuccessfulPayment(
    transactionId: string,
    userId: string,
    productId: string,
    address: string,
    city: string,
    department: string,
  ) {
    try {
      await this.deliveryRepository.create({
        transactionId,
        userId,
        address,
        city,
        department,
        status: 'PENDING',
      });

      await this.productRepository.decrementStock(productId);
    } catch (e) {
      this.logger.warn(
        `Error en lógica post-pago (posible ejecución duplicada) para TX ${transactionId}: ${e.message}`,
      );
    }
  }

  async getTransaction(id: string): Promise<CreateTransactionResponse> {
    try {
      const result = await this.paymentGateway.getTransaction(id);
      const wompiStatus = result.data.status;

      const localTx = await this.transactionRepository.findByWompiId(id);
      if (
        localTx &&
        localTx.status === 'PENDING' &&
        wompiStatus !== 'PENDING'
      ) {
        await this.transactionRepository.updateStatus(localTx.id, wompiStatus);

        if (wompiStatus === 'APPROVED') {
          const product = await this.productRepository.findOne(
            localTx.productId,
          );
          if (product) {
            await this.handleSuccessfulPayment(
              localTx.id,
              localTx.userId,
              product.id,
              localTx.shippingAddress || '',
              localTx.shippingCity || '',
              localTx.shippingDepartment || '',
            );
          }
        }
      }

      return result;
    } catch (error) {
      this.logger.error(
        `Error al sincronizar transacción ${id}: ${error.message}`,
      );
      throw new InternalServerErrorException('Error al obtener transaction');
    }
  }

  async paymentsStatus() {
    return this.transactionRepository.findAllWithUser();
  }
}
