import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
  ValidateIf,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @Length(5, 100, { message: 'Name must be between 3 and 100 characters' })
  name?: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @Matches(/^\+?\d{9,}$/, {
    message: 'Phone must be a valid number with at least 9 digits starting with DDI (ex: +123499999)',
  })
  phone?: string | null;
}
