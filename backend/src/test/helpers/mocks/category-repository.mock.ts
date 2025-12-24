import { CategoryRepositoryPort } from '@/application/ports/out/repositories/category.repository.port';

export const createMockCategoryRepository =
  (): jest.Mocked<CategoryRepositoryPort> => ({
    create: jest.fn(),
    findById: jest.fn(),
    findByRestaurantId: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByName: jest.fn(),
  });

