import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class CreateCardTokenDto {
  @ApiProperty({
    description: 'Número de la tarjeta (13-19 dígitos)',
    example: '4242424242424242',
  })
  @IsString()
  @Matches(/^\d{13,19}$/, { message: 'Número de tarjeta inválido' })
  number: string;

  @ApiProperty({ description: 'Mes de expiración (MM)', example: '12' })
  @IsString()
  @Matches(/^(0[1-9]|1[0-2])$/, {
    message: 'Mes de expiración inválido (01-12)',
  })
  exp_month: string;

  @ApiProperty({ description: 'Año de expiración (YY)', example: '25' })
  @IsString()
  @Matches(/^\d{2}$/, { message: 'Año de expiración inválido (2 dígitos)' })
  exp_year: string;

  @ApiProperty({ description: 'Código CVC (3-4 dígitos)', example: '123' })
  @IsString()
  @Matches(/^\d{3,4}$/, { message: 'CVC inválido (3 o 4 dígitos)' })
  cvc: string;

  @ApiProperty({
    description: 'Nombre del titular de la tarjeta',
    example: 'JUAN PEREZ',
  })
  @IsString()
  @Length(5, 100, {
    message: 'El nombre del tarjetahabiente debe tener mínimo 5 caracteres',
  })
  card_holder: string;
}
