import { v7 as uuidv7 } from 'uuid';

export interface TestRestaurant {
  id: string;
  userId: string;
  name: string;
  description?: string;
  email: string;
  phone: string;
  deliveryFee: number;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  preparationTime?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const createTestRestaurant = (
  overrides?: Partial<TestRestaurant>,
): TestRestaurant => {
  const defaultRestaurant: TestRestaurant = {
    id: uuidv7(),
    userId: uuidv7(),
    name: 'Test Restaurant',
    description: 'A test restaurant',
    email: `restaurant-${Date.now()}@example.com`,
    phone: '+5511988888888',
    deliveryFee: 5.0,
    deliveryTimeMin: 20,
    deliveryTimeMax: 40,
    preparationTime: 30,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    ...defaultRestaurant,
    ...overrides,
  };
};

