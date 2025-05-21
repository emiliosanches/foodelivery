import { RegisterUserDto } from '@/application/dtos/user.dto';
import { User } from '@/domain/entities/user.entity';

export interface AuthServicePort {
  register(userData: RegisterUserDto): Promise<User>;
  login(
    email: string,
    password: string,
  ): Promise<{ token: string; user: User }>;
  validateUser(email: string, password: string): Promise<User | null>;
}
