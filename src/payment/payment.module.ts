import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PAYMENT_GATEWAY } from './domain/payment-gateway.repository';
import { ProductModule } from '../product/product.module';
import { TRANSACTION_REPOSITORY } from './domain/transaction.repository';
import { PrismaTransactionRepository } from './infrastructure/persistence/prisma-transaction.repository';
import { DELIVERY_REPOSITORY } from './domain/delivery.repository';
import { PrismaDeliveryRepository } from './infrastructure/persistence/prisma-delivery.repository';
import { USER_REPOSITORY } from './domain/user.repository';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository';
import { PaymentService } from './application/payment.service';
import { PaymentController } from './infrastructure/controllers/payment.controller';
import { WompiPaymentAdapter } from './infrastructure/persistence/wompi-payment.adapter';

@Module({
  imports: [ConfigModule.forRoot(), HttpModule, ProductModule],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    {
      provide: PAYMENT_GATEWAY,
      useClass: WompiPaymentAdapter,
    },
    {
      provide: TRANSACTION_REPOSITORY,
      useClass: PrismaTransactionRepository,
    },
    {
      provide: DELIVERY_REPOSITORY,
      useClass: PrismaDeliveryRepository,
    },
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
})
export class PaymentModule {}
