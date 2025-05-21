import { UserRole } from '@/domain/entities/user.entity';

export class CreateUserDto {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: UserRole;
}

export class UpdateUserDto {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
}

export class RegisterUserDto extends CreateUserDto {}
