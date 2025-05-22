import {
  IsEmail,
  IsInt,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  Length,
  Min,
  MinLength,
} from 'class-validator';

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
}
