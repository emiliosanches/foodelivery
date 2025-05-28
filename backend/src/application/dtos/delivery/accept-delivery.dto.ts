import { IsIn } from 'class-validator';
import { DeliveryStatus } from '@/domain/delivery/entities/delivery.entity';

export class UpdateDeliveryStatusDto {
  @IsIn(['ACCEPTED', 'PICKED_UP', 'DELIVERED'])
  status: DeliveryStatus;
}
