import { RestaurantRepositoryPort } from '@/application/ports/out/repositories/restaurant.repository.port';

export const createMockRestaurantRepository =
  (): jest.Mocked<RestaurantRepositoryPort> => ({
    create: jest.fn(),
    findById: jest.fn(),
    findByUserId: jest.fn(),
    findByEmail: jest.fn(),
    update: jest.fn(),
    findAll: jest.fn(),
    count: jest.fn(),
    findByCity: jest.fn(),
    countByCity: jest.fn(),
  });

