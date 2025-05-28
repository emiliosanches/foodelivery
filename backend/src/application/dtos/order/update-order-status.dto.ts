import { OrderStatus } from '@/domain/orders';
import { Transform } from 'class-transformer';
import { IsIn, IsString, ValidateIf } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsString({ message: 'newStatus must be a string' })
  @IsIn([
    'PENDING',
    'PREPARING',
    'READY',
    'PICKED_UP',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
  ])
  newStatus: OrderStatus;

  @ValidateIf((o) => o.newStatus === 'CANCELLED')
  @IsString({ message: 'reason must be a string' })
  @Transform(({ value }) => value?.trim())
  reason?: string;
}
