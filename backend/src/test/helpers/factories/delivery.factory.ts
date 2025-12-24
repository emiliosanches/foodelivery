import {
  Delivery,
  DeliveryStatus,
} from '@/domain/delivery/entities/delivery.entity';
import { v7 as uuidv7 } from 'uuid';

export const createTestDelivery = (overrides?: Partial<Delivery>): Delivery => {
  const defaultDelivery: Delivery = {
    id: uuidv7(),
    orderId: uuidv7(),
    deliveryPersonId: null,
    status: 'PENDING' as DeliveryStatus,
    currentLatitude: undefined,
    currentLongitude: undefined,
    acceptedAt: undefined,
    pickedUpAt: undefined,
    deliveredAt: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    ...defaultDelivery,
    ...overrides,
  };
};

