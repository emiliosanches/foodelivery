import { DeliveryWithRelations } from '@/application/dtos/delivery/delivery-response.dto';
import { Delivery } from '@/domain/delivery/entities/delivery.entity';

export abstract class DeliveryRepositoryPort {
  abstract create(delivery: Delivery): Promise<Delivery>;

  abstract findById(id: string): Promise<Delivery | null>;

  abstract findByIdAndRestaurantId(
    id: string,
    restaurantId: string,
  ): Promise<Delivery | null>;

  abstract findByIdAndCustomerId(
    deliveryId: string,
    customerId: string,
  ): Promise<Delivery | null>;

  abstract findByIdWithRelations(
    id: string,
  ): Promise<DeliveryWithRelations | null>;

  abstract findByOrderId(orderId: string): Promise<Delivery | null>;

  abstract update(id: string, data: Partial<Delivery>): Promise<Delivery>;

  abstract findByDeliveryPersonId(
    deliveryPersonId: string,
  ): Promise<DeliveryWithRelations[]>;
}
