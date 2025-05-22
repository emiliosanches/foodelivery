import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { User } from '@/domain/entities/user.entity';
import { UpdateUserDto } from '@/application/dtos/user/update-user.dto';
import { UserRepositoryPort } from '../ports/out/repositories/user.repository.port';
import { UserServicePort } from '../ports/in/services/user.service.port';

@Injectable()
export class UsersService extends UserServicePort {
  constructor(private readonly userRepository: UserRepositoryPort) {
    super();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    if (data.email) {
      const existingUser = await this.userRepository.findByEmail(data.email);

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already in use');
      }
    }

    const user = await this.userRepository.findById(id);

    if (!user) throw new NotFoundException('User not found');

    return await this.userRepository.update(id, data);
  }
}
