import { RegisterUserDto, LoginDto } from '@/application/dtos/auth/auth.dto';
import { User } from '@/domain/entities/user.entity';

export abstract class AuthServicePort {
  abstract register(userData: RegisterUserDto): Promise<User>;
  abstract login(LoginDto: LoginDto): Promise<{ token: string; user: User }>;
  abstract validateUser(email: string, password: string): Promise<User | null>;
}
