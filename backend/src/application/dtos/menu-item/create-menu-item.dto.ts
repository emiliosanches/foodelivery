import {
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Min,
  MinLength,
} from 'class-validator';

export class CreateMenuItemDto {
  @IsString()
  @Length(2, 50)
  name: string;

  @IsString()
  @MinLength(10)
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(1)
  price: number;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  preparationTimeMin?: number;
}
