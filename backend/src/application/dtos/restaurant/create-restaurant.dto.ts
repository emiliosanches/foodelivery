import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsPostalCode,
  IsString,
  IsUrl,
  Length,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CreateRestaurantAddressDto {
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
}

export class CreateRestaurantDto {
  @IsString()
  @Length(3, 100)
  name: string;

  @IsString()
  @MinLength(10)
  @IsOptional()
  description?: string;

  @IsPhoneNumber()
  phone: string;

  @IsEmail()
  email: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsInt()
  @Min(0)
  deliveryFee: number;

  @IsInt()
  @Min(1)
  deliveryTimeMin: number;

  @IsInt()
  @Min(10)
  deliveryTimeMax: number;

  @ValidateNested()
  @IsObject()
  @Type(() => CreateRestaurantAddressDto)
  address: CreateRestaurantAddressDto;
}
