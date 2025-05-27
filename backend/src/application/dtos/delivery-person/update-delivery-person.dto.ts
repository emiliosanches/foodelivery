import {
  IsOptional,
  IsString,
  Length,
  IsNumber,
  Min,
  Max,
  IsIn,
} from 'class-validator';
import {
  VehicleType,
  DeliveryPersonAvailability,
} from '@/domain/delivery-person/entities/delivery-person.entity';

export class UpdateDeliveryPersonDto {
  @IsOptional()
  @IsIn(['BICYCLE', 'MOTORCYCLE', 'CAR'])
  vehicleType?: VehicleType;

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

export class UpdateLocationDto {
  @IsNumber({}, { message: 'Latitude must be a number' })
  @Min(-90, { message: 'Latitude must be between -90 and 90' })
  @Max(90, { message: 'Latitude must be between -90 and 90' })
  latitude: number;

  @IsNumber({}, { message: 'Longitude must be a number' })
  @Min(-180, { message: 'Longitude must be between -180 and 180' })
  @Max(180, { message: 'Longitude must be between -180 and 180' })
  longitude: number;
}

export class UpdateAvailabilityDto {
  @IsIn(['AVAILABLE', 'OFFLINE'])
  availability: Exclude<DeliveryPersonAvailability, 'BUSY'>;
}
