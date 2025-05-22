export type AddressType = 'HOME' | 'BUSINESS' | 'RESTAURANT' | 'OTHER';

export class Address {
  id: string;
  userId?: string;
  restaurantId?: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
  type: AddressType;
  createdAt: Date;
  updatedAt: Date;
}
