export type DeliveryStatus = 'PENDING' | 'ACCEPTED' | 'PICKED_UP' | 'DELIVERED';

export class Delivery {
  id: string;
  orderId: string;
  deliveryPersonId: string;
  status: DeliveryStatus;
  currentLatitude?: number;
  currentLongitude?: number;
  acceptedAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
