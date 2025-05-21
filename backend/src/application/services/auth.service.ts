import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v7 as uuidv7 } from 'uuid';

import { AuthServicePort } from '@/application/ports/in/services/auth.service.port';
import { UserRepositoryPort } from '@/application/ports/out/repositories/user.repository.port';
import { RegisterUserDto, LoginDto } from '@/application/dtos/auth/auth.dto';
import { User } from '@/domain/entities/user.entity';

@Injectable()
export class AuthService implements AuthServicePort {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly jwtService: JwtService,
  ) {}

  async register(userData: RegisterUserDto): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser: User = {
      id: uuidv7(),
      email: userData.email,
      password: hashedPassword,
      name: userData.name,
      phone: userData.phone,
      role: userData.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.userRepository.create(newUser);
  }

  async login(credentials: LoginDto): Promise<{ token: string; user: User }> {
    const user = await this.validateUser(
      credentials.email,
      credentials.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const { password, ...userWithoutPassword } = user;

    return {
      token: this.jwtService.sign(payload),
      user: userWithoutPassword as User,
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }
}
