import { IsOptional, IsString, Length } from 'class-validator';

export class UpdatePaymentMethodDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  cardHolderName?: string;
}
