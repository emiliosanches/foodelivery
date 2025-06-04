import { Order, OrderStatus } from '@/domain/orders';

export class OrderStatusUpdatedEvent {
  static event = 'order.status-updated';

  order: Order;
  newStatus: OrderStatus;
}

