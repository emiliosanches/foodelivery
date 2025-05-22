import { Restaurant } from '@/domain/entities/restaurant.entity';
import { User } from '@/domain/entities/user.entity';
import { DeliveryPerson } from '@/domain/entities/delivery-person.entity';

export class UserWithProfileTypeDto extends User {
  restaurant?: Restaurant;
  deliveryPerson?: DeliveryPerson;
}
