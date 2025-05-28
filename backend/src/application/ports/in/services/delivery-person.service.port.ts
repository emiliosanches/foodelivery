import { DeliveryPerson } from '@/domain/delivery-person/entities/delivery-person.entity';
import { CreateDeliveryPersonDto } from '@/application/dtos/delivery-person/create-delivery-person.dto';
import { UpdateDeliveryPersonDto } from '@/application/dtos/delivery-person/update-delivery-person.dto';

export abstract class DeliveryPersonServicePort {
  abstract create(
    userId: string,
    data: CreateDeliveryPersonDto,
  ): Promise<DeliveryPerson>;
  abstract findById(id: string): Promise<DeliveryPerson>;
  abstract findByUserId(userId: string): Promise<DeliveryPerson | null>;
  abstract update(
    id: string,
    data: UpdateDeliveryPersonDto,
  ): Promise<DeliveryPerson>;
  abstract updateLocation(
    id: string,
    latitude: number,
    longitude: number,
  ): Promise<DeliveryPerson>;
  abstract goOnline(id: string): Promise<DeliveryPerson>;
  abstract goOffline(id: string): Promise<DeliveryPerson>;
  abstract startDelivery(id: string): Promise<DeliveryPerson>;
  abstract finishDelivery(id: string): Promise<DeliveryPerson>;
  abstract findAvailableNearby(
    restaurantLat: number,
    restaurantLon: number,
    maxRadius?: number,
  ): Promise<DeliveryPerson[]>;
}
