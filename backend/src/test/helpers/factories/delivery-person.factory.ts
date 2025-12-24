import {
  DeliveryPerson,
  DeliveryPersonAvailability,
} from '@/domain/delivery-person/entities/delivery-person.entity';
import { v7 as uuidv7 } from 'uuid';

export const createTestDeliveryPerson = (
  overrides?: Partial<DeliveryPerson>,
): DeliveryPerson => {
  const defaultDeliveryPerson: DeliveryPerson = {
    id: uuidv7(),
    userId: uuidv7(),
    availability: 'AVAILABLE' as DeliveryPersonAvailability,
    vehicleType: 'MOTORCYCLE',
    vehiclePlate: 'ABC-1234',
    currentLatitude: -23.5505,
    currentLongitude: -46.6333,
    deliveryRadius: 10.0,
    totalDeliveries: 0,
    rating: 5.0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    ...defaultDeliveryPerson,
    ...overrides,
  };
};

