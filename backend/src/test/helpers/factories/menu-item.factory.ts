import { MenuItem } from '@/domain/entities/menu-item.entity';
import { v7 as uuidv7 } from 'uuid';

export const createTestMenuItem = (overrides?: Partial<MenuItem>): MenuItem => {
  const defaultMenuItem: MenuItem = {
    id: uuidv7(),
    categoryId: uuidv7(),
    name: 'Test Menu Item',
    description: 'A delicious test item',
    price: 25.0,
    imageUrl: 'https://example.com/image.jpg',
    isActive: true,
    isAvailable: true,
    preparationTimeMin: 15,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    ...defaultMenuItem,
    ...overrides,
  };
};

