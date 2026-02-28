import { Module } from '@nestjs/common';
import { ProductModule } from './product/product.module';
import { PaymentModule } from './payment/payment.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ProductModule,
    PaymentModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
