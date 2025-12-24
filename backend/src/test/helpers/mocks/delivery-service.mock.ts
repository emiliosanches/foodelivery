import { DeliveryServicePort } from '@/application/ports/in/services/delivery.service.port';

export const createMockDeliveryService = (): jest.Mocked<
  Partial<DeliveryServicePort>
> => {
  return {
    createDelivery: jest.fn(),
    acceptDelivery: jest.fn(),
    updateDeliveryStatus: jest.fn(),
    findById: jest.fn(),
  } as jest.Mocked<Partial<DeliveryServicePort>>;
};

