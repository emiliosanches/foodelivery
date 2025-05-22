import { IsBoolean, IsOptional, IsString, IsUrl, Length, MinLength } from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @Length(2, 20)
  @IsOptional()
  name?: string;

  @IsString()
  @MinLength(5)
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
