import { OrderCreatedEvent, OrderStatusUpdatedEvent } from '@/domain/events';

export abstract class OrdersEventBusPort {
  abstract emitOrderCreated(event: OrderCreatedEvent): Promise<void>;
  abstract emitOrderStatusUpdated(event: OrderStatusUpdatedEvent): Promise<void>;
}

