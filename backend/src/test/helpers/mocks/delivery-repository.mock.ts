import { DeliveryRepositoryPort } from '@/application/ports/out/repositories/delivery.repository.port';

export const createMockDeliveryRepository =
  (): jest.Mocked<DeliveryRepositoryPort> => {
    return {
      create: jest.fn(),
      findById: jest.fn(),
      findByIdAndRestaurantId: jest.fn(),
      findByIdAndCustomerId: jest.fn(),
      findByIdWithRelations: jest.fn(),
      findByOrderId: jest.fn(),
      update: jest.fn(),
      findByDeliveryPersonId: jest.fn(),
    } as jest.Mocked<DeliveryRepositoryPort>;
  };

