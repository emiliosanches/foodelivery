import { Restaurant } from '@/domain/entities/restaurant.entity';
import { User } from '@/domain/entities/user.entity';
import { Order, OrderItem } from '@/domain/orders';

export class OrderCreatedEvent {
  static event = 'order.created';

  order: Order;
  customer: User;
  restaurant: Restaurant;
  items: OrderItem[];
}

