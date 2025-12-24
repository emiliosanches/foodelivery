import { DeliveryPersonRepositoryPort } from '@/application/ports/out/repositories/delivery-person.repository.port';

export const createMockDeliveryPersonRepository =
  (): jest.Mocked<DeliveryPersonRepositoryPort> => {
    return {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      update: jest.fn(),
      findAvailableInRadius: jest.fn(),
    } as jest.Mocked<DeliveryPersonRepositoryPort>;
  };

