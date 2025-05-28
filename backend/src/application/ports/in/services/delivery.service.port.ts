import { DeliveryWithRelations } from '@/application/dtos/delivery/delivery-response.dto';
import {
  Delivery,
  DeliveryStatus,
} from '@/domain/delivery/entities/delivery.entity';

export abstract class DeliveryServicePort {
  abstract acceptDelivery(
    deliveryId: string,
    deliveryPersonId: string,
  ): Promise<Delivery>;

  abstract updateDeliveryStatus(
    deliveryId: string,
    deliveryPersonId: string,
    status: DeliveryStatus,
  ): Promise<Delivery>;

  abstract updateDeliveryLocation(
    deliveryId: string,
    deliveryPersonId: string,
    latitude: number,
    longitude: number,
  ): Promise<Delivery>;

  abstract getDeliveriesByDeliveryPerson(
    deliveryPersonId: string,
  ): Promise<DeliveryWithRelations[]>;

  abstract getDeliveryById(
    deliveryId: string,
    deliveryPersonId: string,
  ): Promise<DeliveryWithRelations>;

  abstract createDelivery(orderId: string): Promise<Delivery>;
}
