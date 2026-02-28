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

class PaymentMethodDto {
  @IsString()
  @IsIn(['CARD'])
  type: string;

  @IsNumber()
  @Min(1)
  installments: number;

  @IsString()
  token: string;
}

class CustomerDataDto {
  @IsString()
  full_name: string;

  @IsString()
  phone_number: string;

  @IsString()
  legal_id: string;

  @IsString()
  @IsIn(['CC', 'CE', 'NIT', 'PP'])
  legal_id_type: string;
}

export class CreateTransactionDto {
  @IsUUID()
  product_id: string;

  @IsString()
  acceptance_token: string;

  @IsNumber()
  @Min(1)
  amount_in_cents: number;

  @IsString()
  @IsIn(['COP'])
  currency: string;

  @IsEmail()
  customer_email: string;

  @IsObject()
  @ValidateNested()
  @Type(() => PaymentMethodDto)
  payment_method: PaymentMethodDto;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsString()
  @IsOptional()
  signature?: string;

  @IsObject()
  @ValidateNested()
  @Type(() => CustomerDataDto)
  customer_data: CustomerDataDto;

  @IsString()
  @IsOptional()
  redirect_url?: string;
}
