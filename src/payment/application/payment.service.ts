import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
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
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { MerchantResponse } from '../dto/merchant-response.dto';
import { CreateCardTokenDto } from '../dto/create-card-token.dto';
import { CardTokenResponse } from '../dto/card-token-response.dto';
import { CreateTransactionResponse } from '../dto/create-transaction-response.dto';

@Injectable()
export class PaymentService {
  constructor(
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: PaymentGatewayRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
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

    const reference = this.paymentGateway.generateReference();
    const signature = this.paymentGateway.generateSignature(
      reference,
      body.amount_in_cents,
      body.currency,
    );

    const { product_id, ...rest } = body;
    const payload = { ...rest, reference, signature };

    try {
      const result = await this.paymentGateway.createTransaction(payload);

      await this.productRepository.update(body.product_id, {
        stock: product.stock - 1,
      });

      return result;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al crear la transacción');
    }
  }

  async getTransaction(id: string): Promise<CreateTransactionResponse> {
    try {
      return await this.paymentGateway.getTransaction(id);
    } catch {
      throw new InternalServerErrorException('Error al obtener transaction');
    }
  }
}
