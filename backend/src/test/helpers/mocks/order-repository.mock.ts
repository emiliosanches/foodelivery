import { OrderRepositoryPort } from '@/application/ports/out/repositories/order.repository.port';

export const createMockOrderRepository =
  (): jest.Mocked<OrderRepositoryPort> => {
    return {
      createWithItems: jest.fn(),
      findFullOrderById: jest.fn(),
      findByIdWithParts: jest.fn(),
      update: jest.fn(),
      findByCustomerId: jest.fn(),
      findByRestaurantId: jest.fn(),
      findByRestaurantAndStatuses: jest.fn(),
      getRestaurantStatsInTimeRange: jest.fn(),
      getMostOrderedItems: jest.fn(),
    } as jest.Mocked<OrderRepositoryPort>;
  };

