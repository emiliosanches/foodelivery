export class Restaurant {
  id: string;
  userId: string;
  name: string;
  description?: string;
  phone: string;
  email: string;
  imageUrl?: string;
  isActive: boolean;
  deliveryFee: number;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  createdAt: Date;
  updatedAt: Date;
}
