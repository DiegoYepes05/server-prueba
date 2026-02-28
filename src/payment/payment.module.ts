import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PaymentService } from './application/payment.service';
import { PaymentController } from './infrastructure/controllers/payment.controller';
import { WompiPaymentAdapter } from './infrastructure/persistence/wompi-payment.adapter';
import { PAYMENT_GATEWAY } from './domain/payment-gateway.repository';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [ConfigModule.forRoot(), HttpModule, ProductModule],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    {
      provide: PAYMENT_GATEWAY,
      useClass: WompiPaymentAdapter,
    },
  ],
})
export class PaymentModule {}
