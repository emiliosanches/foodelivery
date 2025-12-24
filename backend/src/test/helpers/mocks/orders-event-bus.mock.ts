import { OrdersEventBusPort } from '@/application/ports/out/event-bus';

export const createMockOrdersEventBus = (): jest.Mocked<OrdersEventBusPort> => {
  return {
    emitOrderCreated: jest.fn(),
    emitOrderStatusUpdated: jest.fn(),
  } as jest.Mocked<OrdersEventBusPort>;
};

