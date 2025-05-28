export type DeliveryPersonAvailability = 'AVAILABLE' | 'BUSY' | 'OFFLINE';

export type VehicleType = 'BICYCLE' | 'MOTORCYCLE' | 'CAR';

export class DeliveryPerson {
  id: string;
  userId: string;
  availability: DeliveryPersonAvailability;
  vehicleType: VehicleType;
  vehiclePlate?: string;
  currentLatitude?: number;
  currentLongitude?: number;
  deliveryRadius: number;
  totalDeliveries: number;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
  lastOnlineAt?: Date;
}
