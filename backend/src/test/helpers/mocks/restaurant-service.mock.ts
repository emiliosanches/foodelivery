import { RestaurantServicePort } from '@/application/ports/in/services/restaurant.service.port';

export const createMockRestaurantService = (): jest.Mocked<
  Partial<RestaurantServicePort>
> => {
  return {
    findById: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  } as jest.Mocked<Partial<RestaurantServicePort>>;
};

