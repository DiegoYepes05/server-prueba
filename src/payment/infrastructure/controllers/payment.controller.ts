import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentService } from '../../application/payment.service';
import { CreateCardTokenDto } from '../../dto/create-card-token.dto';
import { CreateTransactionDto } from '../../dto/create-transaction.dto';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('merchants')
  @ApiOperation({ summary: 'Obtener información del comercio (Wompi)' })
  @ApiResponse({ status: 200, description: 'Información del comercio' })
  getMerchantInfo() {
    return this.paymentService.getMerchantInfo();
  }

  @Post('create-card-token')
  @ApiOperation({ summary: 'Crear un token de tarjeta en Wompi' })
  @ApiResponse({ status: 201, description: 'Token de tarjeta creado' })
  createCardToken(@Body() body: CreateCardTokenDto) {
    return this.paymentService.createCardToken(body);
  }

  @Post('create-transaction')
  @ApiOperation({ summary: 'Crear una transacción de pago' })
  @ApiResponse({ status: 201, description: 'Transacción iniciada' })
  createTransaction(@Body() body: CreateTransactionDto) {
    return this.paymentService.createTransaction(body);
  }

  @Get('transaction/:id')
  @ApiOperation({ summary: 'Consultar el estado de una transacción' })
  @ApiResponse({ status: 200, description: 'Estado de la transacción' })
  getTransaction(@Param('id') id: string) {
    return this.paymentService.getTransaction(id);
  }

  @Get('payments-status')
  @ApiOperation({
    summary: 'Obtener el historial de transacciones con datos de usuario',
  })
  @ApiResponse({ status: 200, description: 'Lista de transacciones' })
  getPaymentsStatus() {
    return this.paymentService.paymentsStatus();
  }
}
