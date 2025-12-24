import { UserRepositoryPort } from '@/application/ports/out/repositories/user.repository.port';

export const createMockUserRepository = (): jest.Mocked<UserRepositoryPort> => {
  return {
    findById: jest.fn(),
    findByIdWithProfileType: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  } as jest.Mocked<UserRepositoryPort>;
};

