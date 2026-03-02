import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from '../src/payment/application/payment.service';
import { PAYMENT_GATEWAY } from '../src/payment/domain/payment-gateway.repository';
import { PRODUCT_REPOSITORY } from '../src/product/domain/product.repository';
import { TRANSACTION_REPOSITORY } from '../src/payment/domain/transaction.repository';
import { DELIVERY_REPOSITORY } from '../src/payment/domain/delivery.repository';
import { USER_REPOSITORY } from '../src/payment/domain/user.repository';
import {
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('PaymentService', () => {
  let service: PaymentService;
  let paymentGateway: any;
  let productRepository: any;
  let transactionRepository: any;
  let deliveryRepository: any;
  let userRepository: any;

  beforeEach(async () => {
    paymentGateway = {
      getMerchantInfo: jest.fn(),
      createCardToken: jest.fn(),
      generateReference: jest.fn(),
      generateSignature: jest.fn(),
      createTransaction: jest.fn(),
      getTransaction: jest.fn(),
    };
    productRepository = {
      findOne: jest.fn(),
      update: jest.fn(),
      decrementStock: jest.fn(),
    };
    transactionRepository = {
      create: jest.fn(),
      updateStatus: jest.fn(),
      findByWompiId: jest.fn(),
      findAllWithUser: jest.fn(),
    };
    deliveryRepository = { create: jest.fn() };
    userRepository = { findByEmail: jest.fn(), create: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: PAYMENT_GATEWAY, useValue: paymentGateway },
        { provide: PRODUCT_REPOSITORY, useValue: productRepository },
        { provide: TRANSACTION_REPOSITORY, useValue: transactionRepository },
        { provide: DELIVERY_REPOSITORY, useValue: deliveryRepository },
        { provide: USER_REPOSITORY, useValue: userRepository },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('getMerchantInfo', () => {
    it('debería retornar info del merchant', async () => {
      const resp = { data: { id: 1 } };
      paymentGateway.getMerchantInfo.mockResolvedValue(resp);
      expect(await service.getMerchantInfo()).toEqual(resp);
    });

    it('debería lanzar InternalServerErrorException si falla', async () => {
      paymentGateway.getMerchantInfo.mockRejectedValue(new Error());
      await expect(service.getMerchantInfo()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('createCardToken', () => {
    it('debería crear un token de tarjeta', async () => {
      const resp = { data: { id: 'token1' } };
      paymentGateway.createCardToken.mockResolvedValue(resp);
      expect(await service.createCardToken({} as any)).toEqual(resp);
    });

    it('debería lanzar InternalServerErrorException si falla', async () => {
      paymentGateway.createCardToken.mockRejectedValue(new Error());
      await expect(service.createCardToken({} as any)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('createTransaction', () => {
    const dto = {
      product_id: 'prod1',
      customer_email: 'test@test.com',
      customer_data: {
        full_name: 'Test',
        phone_number: '123',
        legal_id: '456',
        legal_id_type: 'CC',
      },
      amount_in_cents: 1000,
      currency: 'COP',
      payment_method: { installments: 1 },
      shipping_info: { address: 'Calle 1', city: 'Bogota', department: 'DC' },
    } as any;

    it('debería lanzar NotFoundException si el producto no existe', async () => {
      productRepository.findOne.mockResolvedValue(null);
      await expect(service.createTransaction(dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debería lanzar BadRequestException si no hay stock', async () => {
      productRepository.findOne.mockResolvedValue({ id: 'prod1', stock: 0 });
      await expect(service.createTransaction(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debería crear el usuario si no existe', async () => {
      productRepository.findOne.mockResolvedValue({ id: 'prod1', stock: 10 });
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue({
        id: 'user-new',
        email: 'test@test.com',
      });
      paymentGateway.generateReference.mockReturnValue('REF1');
      paymentGateway.generateSignature.mockReturnValue('SIG1');
      transactionRepository.create.mockResolvedValue({
        id: 'tx1',
        reference: 'REF1',
      });
      paymentGateway.createTransaction.mockResolvedValue({
        data: { id: 999, status: 'APPROVED' },
      });

      await service.createTransaction(dto);

      expect(userRepository.create).toHaveBeenCalled();
      expect(transactionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-new' }),
      );
    });

    it('debería crear una transacción APPROVED con entrega', async () => {
      productRepository.findOne.mockResolvedValue({ id: 'prod1', stock: 10 });
      userRepository.findByEmail.mockResolvedValue({
        id: 'user1',
        email: 'test@test.com',
      });
      paymentGateway.generateReference.mockReturnValue('REF1');
      paymentGateway.generateSignature.mockReturnValue('SIG1');
      transactionRepository.create.mockResolvedValue({
        id: 'tx1',
        reference: 'REF1',
      });
      paymentGateway.createTransaction.mockResolvedValue({
        data: { id: 999, status: 'APPROVED' },
      });

      await service.createTransaction(dto);

      expect(transactionRepository.updateStatus).toHaveBeenCalledWith(
        'tx1',
        'APPROVED',
        '999',
      );
      expect(deliveryRepository.create).toHaveBeenCalled();
      expect(productRepository.decrementStock).toHaveBeenCalledWith('prod1');
    });

    it('debería manejar error de Wompi y marcar ERROR', async () => {
      productRepository.findOne.mockResolvedValue({ id: 'prod1', stock: 10 });
      userRepository.findByEmail.mockResolvedValue({ id: 'user1' });
      paymentGateway.generateReference.mockReturnValue('REF1');
      paymentGateway.generateSignature.mockReturnValue('SIG1');
      transactionRepository.create.mockResolvedValue({ id: 'tx1' });
      paymentGateway.createTransaction.mockRejectedValue(
        new Error('Wompi Error'),
      );

      await expect(service.createTransaction(dto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(transactionRepository.updateStatus).toHaveBeenCalledWith(
        'tx1',
        'ERROR',
      );
    });
  });

  describe('getTransaction', () => {
    it('debería sincronizar a APPROVED si estaba PENDING', async () => {
      const wompiId = 'w999';
      paymentGateway.getTransaction.mockResolvedValue({
        data: { id: wompiId, status: 'APPROVED' },
      });
      transactionRepository.findByWompiId.mockResolvedValue({
        id: 'tx1',
        status: 'PENDING',
        productId: 'prod1',
        userId: 'user1',
        shippingAddress: 'Calle 1',
        shippingCity: 'Bogota',
        shippingDepartment: 'DC',
      });
      productRepository.findOne.mockResolvedValue({ id: 'prod1', stock: 5 });

      const result = await service.getTransaction(wompiId);

      expect(result.data.status).toBe('APPROVED');
      expect(transactionRepository.updateStatus).toHaveBeenCalledWith(
        'tx1',
        'APPROVED',
      );
      expect(deliveryRepository.create).toHaveBeenCalled();
      expect(productRepository.decrementStock).toHaveBeenCalledWith('prod1');
    });

    it('debería no sincronizar si la transacción ya está APPROVED', async () => {
      paymentGateway.getTransaction.mockResolvedValue({
        data: { id: 'w997', status: 'APPROVED' },
      });
      transactionRepository.findByWompiId.mockResolvedValue({
        id: 'tx3',
        status: 'APPROVED',
      });

      await service.getTransaction('w997');
      expect(transactionRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('debería ser resiliente si el post-pago falla', async () => {
      paymentGateway.getTransaction.mockResolvedValue({
        data: { id: 'w998', status: 'APPROVED' },
      });
      transactionRepository.findByWompiId.mockResolvedValue({
        id: 'tx2',
        status: 'PENDING',
        productId: 'prod1',
        userId: 'user1',
      });
      productRepository.findOne.mockResolvedValue({ id: 'prod1', stock: 5 });
      deliveryRepository.create.mockRejectedValue(
        new Error('Post-pago fallido'),
      );

      const result = await service.getTransaction('w998');
      expect(result).toBeDefined();
    });

    it('debería lanzar InternalServerErrorException si Wompi falla', async () => {
      paymentGateway.getTransaction.mockRejectedValue(new Error('Wompi down'));
      await expect(service.getTransaction('bad-id')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('paymentsStatus', () => {
    it('debería retornar todas las transacciones con usuario', async () => {
      transactionRepository.findAllWithUser.mockResolvedValue([]);
      await service.paymentsStatus();
      expect(transactionRepository.findAllWithUser).toHaveBeenCalled();
    });
  });
});
