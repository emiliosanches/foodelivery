import { User } from '@/domain/entities/user.entity';

export abstract class UserRepositoryPort {
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract create(user: User): Promise<User>;
  abstract update(id: string, user: Partial<User>): Promise<User>;
}
