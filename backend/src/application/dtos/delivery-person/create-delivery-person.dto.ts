import {
  IsOptional,
  IsString,
  Length,
  IsNumber,
  Min,
  Max,
  IsIn,
} from 'class-validator';
import { VehicleType } from '@/domain/delivery-person/entities/delivery-person.entity';

export class CreateDeliveryPersonDto {
  @IsIn(['BICYCLE', 'MOTORCYCLE', 'CAR'])
  vehicleType: VehicleType;

  @IsOptional()
  @IsString()
  @Length(7, 8, { message: 'Vehicle plate must have 7 or 8 characters' })
  vehiclePlate?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Delivery radius must be a number' })
  @Min(1, { message: 'Delivery radius must be at least 1 km' })
  @Max(50, { message: 'Delivery radius cannot exceed 50 km' })
  deliveryRadius?: number;
}
