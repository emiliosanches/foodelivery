import {
  IsBoolean,
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

export class UpdateRestaurantDto {
  @IsString()
  @Length(3, 100)
  @IsOptional()
  name?: string;

  @IsString()
  @MinLength(10)
  @IsOptional()
  description?: string;

  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  deliveryFee?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  deliveryTimeMin?: number;

  @IsInt()
  @Min(10)
  @IsOptional()
  deliveryTimeMax?: number;
}
