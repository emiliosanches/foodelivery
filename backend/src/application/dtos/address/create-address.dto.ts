import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  MaxLength,
  Length,
  IsPostalCode,
  Min,
  Max,
} from 'class-validator';
import { AddressType } from '@/domain/entities/address.entity';

export class CreateAddressDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  street: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  number: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  complement?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  neighborhood: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  city: string;

  @IsString()
  @Length(2, 2)
  state: string;

  @IsPostalCode('any')
  postalCode: string;

  @IsString()
  @Length(2, 2)
  country: string;

  @IsNumber({}, { message: 'Latitude must be a number' })
  @Min(-90, { message: 'Latitude must be between -90 and 90' })
  @Max(90, { message: 'Latitude must be between -90 and 90' })
  latitude: number;

  @IsNumber({}, { message: 'Longitude must be a number' })
  @Min(-180, { message: 'Longitude must be between -180 and 180' })
  @Max(180, { message: 'Longitude must be between -180 and 180' })
  longitude: number;

  @IsOptional()
  @IsEnum(['HOME', 'BUSINESS', 'RESTAURANT', 'OTHER'])
  type?: AddressType;
}
