import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  MaxLength,
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

  @IsNotEmpty()
  @IsString()
  @MaxLength(2)
  state: string;

  @IsNotEmpty()
  @IsString()
  postalCode: string;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  country?: string;

  @IsNotEmpty()
  @IsNumber()
  latitude: number;

  @IsNotEmpty()
  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsEnum(['HOME', 'BUSINESS', 'RESTAURANT', 'OTHER'])
  type?: AddressType;
}
