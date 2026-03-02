import { Module } from '@nestjs/common';
import { ProductModule } from './product/product.module';
import { PaymentModule } from './payment/payment.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    ProductModule,
    PaymentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
