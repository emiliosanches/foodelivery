import { IsNotEmpty, IsString, IsEnum, Matches, Length } from 'class-validator';
import { StoredPaymentType } from '@/domain/entities/payment-method.entity';

export class CreatePaymentMethodDto {
  @IsNotEmpty()
  @IsEnum(['CREDIT_CARD', 'DEBIT_CARD', 'VOUCHER'])
  type: StoredPaymentType;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{13,19}$/, {
    message: 'Número do cartão deve ter entre 13 e 19 dígitos',
  })
  cardNumber: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 100)
  cardHolderName: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^(0[1-9]|1[0-2])$/, { message: 'Mês deve estar entre 01 e 12' })
  expiryMonth: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}$/, { message: 'Ano deve ter 4 dígitos' })
  expiryYear: string;

  @IsNotEmpty()
  @IsString()
  @Length(3, 4)
  cvc: string;
}
