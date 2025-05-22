import { IsOptional, IsString, IsUrl, Length, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @Length(2, 20)
  name: string;

  @IsString()
  @MinLength(5)
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;
}
