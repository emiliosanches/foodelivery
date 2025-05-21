import { CreateUserDto, UpdateUserDto } from '@/application/dtos/user/user.dto';
import { User } from '@/domain/entities/user.entity';

export abstract class UserServicePort {
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract create(userData: CreateUserDto): Promise<User>;
  abstract update(id: string, userData: UpdateUserDto): Promise<User>;
}
