import { MenuItemRepositoryPort } from '@/application/ports/out/repositories/menu-item.repository.port';

export const createMockMenuItemRepository =
  (): jest.Mocked<MenuItemRepositoryPort> => {
    return {
      findById: jest.fn(),
      findByIdAndRestaurantId: jest.fn(),
      findByRestaurantId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByCategoryId: jest.fn(),
      findByName: jest.fn(),
    } as jest.Mocked<MenuItemRepositoryPort>;
  };

