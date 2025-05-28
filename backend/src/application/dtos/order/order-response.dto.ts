import { Delivery } from '@/domain/delivery';
import { Address } from '@/domain/entities/address.entity';
import { PaymentMethod } from '@/domain/entities/payment-method.entity';
import { Restaurant } from '@/domain/entities/restaurant.entity';
import { User } from '@/domain/entities/user.entity';
import { Order, OrderItem } from '@/domain/orders';

export class FullOrderDto extends Order {
  restaurant: Restaurant;
  delivery: Delivery | null;
  orderItems: OrderItem[];
  deliveryAddress: Address;
  paymentMethod: PaymentMethod | null;
  customer: User;
}

export class OrderWithPartsDto extends Order {
  restaurant: Restaurant;
  delivery: Delivery | null;
  customer: User;
}
