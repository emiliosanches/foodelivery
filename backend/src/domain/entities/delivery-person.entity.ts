export type VehicleType = 'MOTORCYCLE' | 'BICYCLE' | 'CAR' | 'WALKING';
export type DocumentType =
  | 'CPF'
  | 'CNPJ'
  | 'SSN'
  | 'NIF'
  | 'DNI'
  | 'PASSPORT'
  | 'NATIONAL_ID'
  | 'OTHER';

export class DeliveryPerson {
  id: string;
  userId: string;
  vehicleType: VehicleType;
  vehiclePlate?: string;
  driverLicense?: string;
  document: string;
  documentType: DocumentType;
  isActive: boolean;
  isAvailable: boolean;
  currentLatitude?: number;
  currentLongitude?: number;
  rating?: number;
  totalDeliveries: number;
  createdAt: Date;
  updatedAt: Date;
}
