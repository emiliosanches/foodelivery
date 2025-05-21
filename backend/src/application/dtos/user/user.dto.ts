import { UserRole } from '@/domain/entities/user.entity';
import { IsOptional, IsString, ValidateIf } from 'class-validator';

export class CreateUserDto {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: UserRole;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  phone?: string | null;

  @IsString()
  @IsOptional()
  password?: string;
}
