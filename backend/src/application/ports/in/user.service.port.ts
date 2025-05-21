import { CreateUserDto, UpdateUserDto } from '@/application/dtos/user.dto';
import { User } from '@/domain/entities/user.entity';

export interface UserServicePort {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(userData: CreateUserDto): Promise<User>;
  update(id: string, userData: UpdateUserDto): Promise<User>;
}
