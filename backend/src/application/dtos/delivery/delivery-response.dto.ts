import { Delivery } from '@/domain/delivery';
import { DeliveryPerson } from '@/domain/delivery-person';
import { Address } from '@/domain/entities/address.entity';
import { Restaurant } from '@/domain/entities/restaurant.entity';
import { User } from '@/domain/entities/user.entity';
import { Order } from '@/domain/orders';

export interface DeliveryWithRelations extends Delivery {
  order: Order & {
    customer: Pick<User, 'id' | 'name' | 'phone'>;
    restaurant: Pick<Restaurant, 'id' | 'name' | 'phone'> & {
      address: Omit<Address, 'isDefault' | 'type' | 'createdAt' | 'updatedAt'>;
    };
    deliveryAddress: Omit<
      Address,
      'isDefault' | 'type' | 'createdAt' | 'updatedAt'
    >;
  };
  deliveryPerson: DeliveryPerson & {
    user: Pick<User, 'id' | 'name' | 'phone'>;
  };
}

export interface DeliveryWithRelationsAndEstimate
  extends DeliveryWithRelations {
  estimateDeliveryTime: number;
}
