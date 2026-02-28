import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PaymentService } from '../../application/payment.service';
import { CreateCardTokenDto } from '../../dto/create-card-token.dto';
import { CreateTransactionDto } from '../../dto/create-transaction.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('merchants')
  getMerchantInfo() {
    return this.paymentService.getMerchantInfo();
  }

  @Post('create-card-token')
  createCardToken(@Body() body: CreateCardTokenDto) {
    return this.paymentService.createCardToken(body);
  }

  @Post('create-transaction')
  createTransaction(@Body() body: CreateTransactionDto) {
    return this.paymentService.createTransaction(body);
  }

  @Get('transaction/:id')
  getTransaction(@Param('id') id: string) {
    return this.paymentService.getTransaction(id);
  }
}
