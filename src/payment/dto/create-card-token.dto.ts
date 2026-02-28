import { IsString, Length, Matches } from 'class-validator';

export class CreateCardTokenDto {
  @IsString()
  @Matches(/^\d{13,19}$/, { message: 'Número de tarjeta inválido' })
  number: string;

  @IsString()
  @Matches(/^(0[1-9]|1[0-2])$/, {
    message: 'Mes de expiración inválido (01-12)',
  })
  exp_month: string;

  @IsString()
  @Matches(/^\d{2}$/, { message: 'Año de expiración inválido (2 dígitos)' })
  exp_year: string;

  @IsString()
  @Matches(/^\d{3,4}$/, { message: 'CVC inválido (3 o 4 dígitos)' })
  cvc: string;

  @IsString()
  @Length(5, 100, {
    message: 'El nombre del tarjetahabiente debe tener mínimo 5 caracteres',
  })
  card_holder: string;
}
