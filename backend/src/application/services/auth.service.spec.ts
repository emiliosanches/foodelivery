import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { AuthService } from '@/application/services/auth.service';
import { UserRepositoryPort } from '@/application/ports/out/repositories/user.repository.port';
import {
  createMockUserRepository,
  createMockJwtService,
} from '@/test/helpers/mocks';
import { createTestUser } from '@/test/helpers/factories';
import { RegisterUserDto, LoginDto } from '@/application/dtos/auth/auth.dto';

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;
  let mockJwtService: ReturnType<typeof createMockJwtService>;

  beforeEach(async () => {
    mockUserRepository = createMockUserRepository();
    mockJwtService = createMockJwtService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepositoryPort,
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user with hashed password', async () => {
      // Arrange
      const registerDto: RegisterUserDto = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        phone: '+5511999999999',
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockImplementation((user) =>
        Promise.resolve(user),
      );

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        registerDto.email,
      );
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(result.email).toBe(registerDto.email);
      expect(result.name).toBe(registerDto.name);
      expect(result.phone).toBe(registerDto.phone);
      expect(result.isAdmin).toBe(false);
      expect(result.password).not.toBe(registerDto.password);

      // Verify password was hashed
      const isPasswordHashed = await bcrypt.compare(
        registerDto.password,
        result.password,
      );
      expect(isPasswordHashed).toBe(true);
    });

    it('should throw ConflictException if email already exists', async () => {
      // Arrange
      const registerDto: RegisterUserDto = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User',
        phone: '+5511999999999',
      };

      const existingUser = createTestUser({ email: registerDto.email });
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        'Email already in use',
      );
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should create user with correct default values', async () => {
      // Arrange
      const registerDto: RegisterUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockImplementation((user) =>
        Promise.resolve(user),
      );

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(result.isAdmin).toBe(false);
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('login', () => {
    it('should return token and user for valid credentials', async () => {
      // Arrange
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = createTestUser({
        email: 'user@example.com',
        password: hashedPassword,
      });

      const loginDto: LoginDto = {
        email: user.email,
        password: password,
      };

      const expectedToken = 'jwt-token-12345';

      mockUserRepository.findByEmail.mockResolvedValue(user);
      mockJwtService.sign.mockReturnValue(expectedToken);

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.token).toBe(expectedToken);
      expect(result.user.email).toBe(user.email);
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      // Arrange
      const password = 'correctpassword';
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = createTestUser({
        email: 'user@example.com',
        password: hashedPassword,
      });

      const loginDto: LoginDto = {
        email: user.email,
        password: 'wrongpassword',
      };

      mockUserRepository.findByEmail.mockResolvedValue(user);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('should generate JWT with correct payload', async () => {
      // Arrange
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = createTestUser({
        email: 'user@example.com',
        password: hashedPassword,
      });

      const loginDto: LoginDto = {
        email: user.email,
        password: password,
      };

      mockUserRepository.findByEmail.mockResolvedValue(user);
      mockJwtService.sign.mockReturnValue('token');

      // Act
      await service.login(loginDto);

      // Assert
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
      });
    });
  });

  describe('validateUser', () => {
    it('should return user for valid credentials', async () => {
      // Arrange
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = createTestUser({
        email: 'user@example.com',
        password: hashedPassword,
      });

      mockUserRepository.findByEmail.mockResolvedValue(user);

      // Act
      const result = await service.validateUser(user.email, password);

      // Assert
      expect(result).toEqual(user);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(user.email);
    });

    it('should return null for non-existent user', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act
      const result = await service.validateUser(
        'nonexistent@example.com',
        'password123',
      );

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for invalid password', async () => {
      // Arrange
      const password = 'correctpassword';
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = createTestUser({
        email: 'user@example.com',
        password: hashedPassword,
      });

      mockUserRepository.findByEmail.mockResolvedValue(user);

      // Act
      const result = await service.validateUser(user.email, 'wrongpassword');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('Edge Cases and Input Validation', () => {
    describe('register with invalid inputs', () => {
      it('should handle very short password', async () => {
        // Arrange
        const registerDto: RegisterUserDto = {
          email: 'test@example.com',
          password: '123', // Very short password
          name: 'Test User',
          phone: '11987654321',
        };

        mockUserRepository.findByEmail.mockResolvedValue(null);

        // Note: Password validation should be done at DTO level with class-validator
        // For now, service accepts any password that bcrypt can hash
        mockUserRepository.create.mockResolvedValue(
          createTestUser({ password: '123' }),
        );

        // Act
        const result = await service.register(registerDto);

        // Assert
        expect(mockUserRepository.create).toHaveBeenCalled();
        expect(result).toBeDefined();
      });

      it('should handle very long password', async () => {
        // Arrange
        const registerDto: RegisterUserDto = {
          email: 'test@example.com',
          password: 'a'.repeat(200), // Very long password
          name: 'Test User',
          phone: '11987654321',
        };

        mockUserRepository.findByEmail.mockResolvedValue(null);

        // Act
        // Should handle without errors (bcrypt can handle long passwords)
        mockUserRepository.create.mockResolvedValue(
          createTestUser({ email: registerDto.email }),
        );
        const result = await service.register(registerDto);

        // Assert
        expect(mockUserRepository.create).toHaveBeenCalled();
        expect(result.email).toBe(registerDto.email);
      });

      it('should handle email with special characters', async () => {
        // Arrange
        const registerDto: RegisterUserDto = {
          email: 'test+alias@sub-domain.example.com',
          password: 'password123',
          name: 'Test User',
          phone: '11987654321',
        };

        mockUserRepository.findByEmail.mockResolvedValue(null);
        mockUserRepository.create.mockResolvedValue(
          createTestUser({ email: registerDto.email }),
        );

        // Act
        const result = await service.register(registerDto);

        // Assert
        expect(result.email).toBe(registerDto.email);
        expect(mockUserRepository.create).toHaveBeenCalled();
      });

      it('should handle name with special characters', async () => {
        // Arrange
        const registerDto: RegisterUserDto = {
          email: 'test@example.com',
          password: 'password123',
          name: "João O'Connor-Smith Jr.", // Special characters in name
          phone: '11987654321',
        };

        mockUserRepository.findByEmail.mockResolvedValue(null);
        mockUserRepository.create.mockResolvedValue(
          createTestUser({ name: registerDto.name }),
        );

        // Act
        const result = await service.register(registerDto);

        // Assert
        expect(result.name).toBe(registerDto.name);
        expect(mockUserRepository.create).toHaveBeenCalled();
      });

      it('should handle phone number with different formats', async () => {
        // Arrange
        const registerDto: RegisterUserDto = {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          phone: '+55 (11) 98765-4321', // Phone with formatting
        };

        mockUserRepository.findByEmail.mockResolvedValue(null);
        mockUserRepository.create.mockResolvedValue(
          createTestUser({ phone: registerDto.phone }),
        );

        // Act
        const result = await service.register(registerDto);

        // Assert
        expect(result.phone).toBe(registerDto.phone);
        expect(mockUserRepository.create).toHaveBeenCalled();
      });
    });

    describe('login with edge cases', () => {
      it('should handle login with email in different case', async () => {
        // Arrange
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = createTestUser({
          email: 'user@example.com',
          password: hashedPassword,
        });

        const loginDto: LoginDto = {
          email: 'USER@EXAMPLE.COM', // Different case
          password: password,
        };

        // Assuming repository handles case-insensitive search
        mockUserRepository.findByEmail.mockResolvedValue(user);
        mockJwtService.sign.mockReturnValue('jwt-token');

        // Act
        const result = await service.login(loginDto);

        // Assert
        expect(result.token).toBe('jwt-token');
      });

      it('should handle login with whitespace in email', async () => {
        // Arrange
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = createTestUser({
          email: 'user@example.com',
          password: hashedPassword,
        });

        const loginDto: LoginDto = {
          email: '  user@example.com  ', // Email with whitespace
          password: password,
        };

        // Should trim email before querying
        mockUserRepository.findByEmail.mockResolvedValue(null);

        // Act & Assert
        await expect(service.login(loginDto)).rejects.toThrow(
          UnauthorizedException,
        );
      });

      it('should handle empty password', async () => {
        // Arrange
        const loginDto: LoginDto = {
          email: 'user@example.com',
          password: '', // Empty password
        };

        mockUserRepository.findByEmail.mockResolvedValue(
          createTestUser({ email: loginDto.email }),
        );

        // Act & Assert
        await expect(service.login(loginDto)).rejects.toThrow(
          UnauthorizedException,
        );
      });
    });

    describe('password comparison edge cases', () => {
      it('should reject password with null characters', async () => {
        // Arrange
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = createTestUser({
          email: 'user@example.com',
          password: hashedPassword,
        });

        mockUserRepository.findByEmail.mockResolvedValue(user);

        // Act
        const result = await service.validateUser(
          user.email,
          'password\x00123', // Password with null character
        );

        // Assert
        // bcrypt comparison should fail
        expect(result).toBeNull();
      });

      it('should handle unicode characters in password', async () => {
        // Arrange
        const password = 'パスワード123'; // Japanese characters
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = createTestUser({
          email: 'user@example.com',
          password: hashedPassword,
        });

        mockUserRepository.findByEmail.mockResolvedValue(user);

        // Act
        const result = await service.validateUser(user.email, password);

        // Assert
        expect(result).toBeDefined();
        expect(result?.id).toBe(user.id);
      });
    });

    describe('concurrent registration attempts', () => {
      it('should handle race condition for duplicate email registration', async () => {
        // Arrange
        const registerDto: RegisterUserDto = {
          email: 'concurrent@example.com',
          password: 'password123',
          name: 'Test User',
          phone: '11987654321',
        };

        // First check returns no user (race condition scenario)
        mockUserRepository.findByEmail.mockResolvedValue(null);

        // But create fails due to unique constraint
        mockUserRepository.create.mockRejectedValue(
          new ConflictException('Email already registered'),
        );

        // Act & Assert
        await expect(service.register(registerDto)).rejects.toThrow(
          ConflictException,
        );
      });
    });
  });
});

