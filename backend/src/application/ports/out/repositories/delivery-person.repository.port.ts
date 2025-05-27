import { DeliveryPerson } from '@/domain/delivery-person/entities/delivery-person.entity';

export abstract class DeliveryPersonRepositoryPort {
  abstract create(deliveryPerson: DeliveryPerson): Promise<DeliveryPerson>;
  abstract findById(id: string): Promise<DeliveryPerson | null>;
  abstract findByUserId(userId: string): Promise<DeliveryPerson | null>;
  abstract update(
    id: string,
    data: Partial<DeliveryPerson>,
  ): Promise<DeliveryPerson>;
  abstract findAvailableInRadius(
    centerLat: number,
    centerLon: number,
    radiusKm: number,
  ): Promise<DeliveryPerson[]>;
}
