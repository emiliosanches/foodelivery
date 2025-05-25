import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsUUID,
  IsInt,
  Min,
  Max,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateOrderItemDto {
  @IsUUID(7, { message: 'menuItemId deve ser um UUID válido' })
  menuItemId: string;

  @IsInt({ message: 'quantity deve ser um número inteiro' })
  @Min(1, { message: 'quantity deve ser pelo menos 1' })
  @Max(50, { message: 'quantity não pode ser maior que 50' })
  quantity: number;

  @IsOptional()
  @IsString({ message: 'notes deve ser uma string' })
  @Transform(({ value }) => value?.trim())
  notes?: string;
}

class PaymentDto {
  type: 'PIX' | 'CASH' | 'STORED_CARD';
}

export class PixPaymentDto extends PaymentDto {
  @IsEnum(['PIX'], { message: 'type deve ser PIX' })
  type: 'PIX';
}

export class CashPaymentDto extends PaymentDto {
  @IsEnum(['CASH'], { message: 'type deve ser CASH' })
  type: 'CASH';

  @IsOptional()
  @IsInt({ message: 'changeFor must be an integer number' })
  @Min(0, { message: 'changeFor must be greater than or equals to 0' })
  changeFor?: number;
}

export class SavedCardPaymentDto extends PaymentDto {
  @IsEnum(['STORED_CARD'], { message: 'type must be STORED_CARD' })
  type: 'STORED_CARD';

  @IsUUID(7, {
    message: 'paymentMethodId must be a valid UUID when type is STORED_CARD',
  })
  paymentMethodId: string;
}

export class CreateOrderDto {
  @IsUUID(7, { message: 'restaurantId must be a valid UUID' })
  restaurantId: string;

  @IsUUID(7, { message: 'deliveryAddressId must be a valid UUID' })
  deliveryAddressId: string;

  @IsArray({ message: 'items deve ser um array' })
  @ArrayMinSize(1, { message: 'There must be at least one item' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ValidateNested()
  @Type(() => PaymentDto, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: 'type',
      subTypes: [
        { name: 'PIX', value: PixPaymentDto },
        { name: 'CASH', value: CashPaymentDto },
        { name: 'SAVED_CARD', value: SavedCardPaymentDto },
      ],
    },
  })
  payment: SavedCardPaymentDto | PixPaymentDto | CashPaymentDto;

  @IsOptional()
  @IsString({ message: 'notes must be a string' })
  @Transform(({ value }) => value?.trim())
  notes?: string;

  @IsOptional()
  @IsInt({ message: 'deliveryFee must be an integer number' })
  @Min(0, { message: 'deliveryFee must be equals to or greater than 0' })
  deliveryFee?: number;
}
