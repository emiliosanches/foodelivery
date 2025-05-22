import { UserWithProfileTypeDto } from '@/application/dtos/user/user-with-profile-type.dto';
import { User } from '@/domain/entities/user.entity';

export abstract class UserRepositoryPort {
  abstract findById(id: string): Promise<User | null>;
  abstract findByIdWithProfileType(id: string): Promise<UserWithProfileTypeDto | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract create(user: User): Promise<User>;
  abstract update(id: string, user: Partial<User>): Promise<User>;
}
