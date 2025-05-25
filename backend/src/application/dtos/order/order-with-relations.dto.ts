import { Restaurant } from '@/domain/entities/restaurant.entity';
import { Order } from '@/domain/orders';

export class OrderWithRestaurant extends Order {
  restaurant: Restaurant;
}
