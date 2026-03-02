import {
  IsString,
  IsNumber,
  IsEmail,
  IsObject,
  IsOptional,
  IsIn,
  Min,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class PaymentMethodDto {
  @ApiProperty({
    description: 'Tipo de pago (actualmente solo CARD)',
    example: 'CARD',
  })
  @IsString()
  @IsIn(['CARD'])
  type: string;

  @ApiProperty({ description: 'Número de cuotas', example: 1 })
  @IsNumber()
  @Min(1)
  installments: number;

  @ApiProperty({
    description: 'Token de la tarjeta generado por Wompi',
    example: 'tok_test_123',
  })
  @IsString()
  token: string;
}

class CustomerDataDto {
  @ApiProperty({
    description: 'Nombre completo del cliente',
    example: 'Juan Perez',
  })
  @IsString()
  full_name: string;

  @ApiProperty({ description: 'Número de teléfono', example: '3001234567' })
  @IsString()
  phone_number: string;

  @ApiProperty({
    description: 'Número de identificación legal',
    example: '12345678',
  })
  @IsString()
  legal_id: string;

  @ApiProperty({
    description: 'Tipo de identificación (CC, CE, NIT, PP)',
    example: 'CC',
  })
  @IsString()
  @IsIn(['CC', 'CE', 'NIT', 'PP'])
  legal_id_type: string;
}

class ShippingInfoDto {
  @ApiProperty({
    description: 'Dirección de envío',
    example: 'Calle 123 # 45-67',
  })
  @IsString()
  address: string;

  @ApiProperty({ description: 'Ciudad', example: 'Bogotá' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'Departamento', example: 'Cundinamarca' })
  @IsString()
  department: string;
}

export class CreateTransactionDto {
  @ApiProperty({
    description: 'ID del producto a comprar',
    example: 'uuid-del-producto',
  })
  @IsUUID()
  product_id: string;

  @ApiProperty({
    description: 'Token de aceptación de términos de Wompi',
    example: 'acceptance_token_123',
  })
  @IsString()
  acceptance_token: string;

  @ApiProperty({ description: 'Monto en centavos', example: 100000 })
  @IsNumber()
  @Min(1)
  amount_in_cents: number;

  @ApiProperty({ description: 'Moneda (actualmente solo COP)', example: 'COP' })
  @IsString()
  @IsIn(['COP'])
  currency: string;

  @ApiProperty({
    description: 'Email del cliente',
    example: 'cliente@ejemplo.com',
  })
  @IsEmail()
  customer_email: string;

  @ApiProperty({ description: 'Método de pago' })
  @IsObject()
  @ValidateNested()
  @Type(() => PaymentMethodDto)
  payment_method: PaymentMethodDto;

  @ApiProperty({ description: 'Referencia única (opcional)', required: false })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiProperty({
    description: 'Firma de seguridad (opcional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  signature?: string;

  @ApiProperty({ description: 'Datos del cliente' })
  @IsObject()
  @ValidateNested()
  @Type(() => CustomerDataDto)
  customer_data: CustomerDataDto;

  @ApiProperty({ description: 'Información de envío' })
  @IsObject()
  @ValidateNested()
  @Type(() => ShippingInfoDto)
  shipping_info: ShippingInfoDto;

  @ApiProperty({
    description: 'URL de redirección (opcional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  redirect_url?: string;
}
