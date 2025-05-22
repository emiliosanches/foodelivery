import { UpdateUserDto } from '@/application/dtos/user/update-user.dto';
import { User } from '@/domain/entities/user.entity';

export abstract class UserServicePort {
  abstract findById(id: string): Promise<User | null>;
  abstract update(id: string, userData: UpdateUserDto): Promise<User>;
}
