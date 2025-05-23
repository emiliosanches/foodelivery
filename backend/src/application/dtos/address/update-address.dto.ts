import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  MaxLength,
} from 'class-validator';
import { AddressType } from '@/domain/entities/address.entity';

export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  street?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  number?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  complement?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  neighborhood?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  state?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  country?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsEnum(['HOME', 'BUSINESS', 'RESTAURANT', 'OTHER'])
  type?: AddressType;
}
