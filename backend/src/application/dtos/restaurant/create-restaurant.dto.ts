export class CreateRestaurantDto {
  name: string;
  description?: string;
  phone: string;
  email: string;
  imageUrl?: string;
  deliveryFee: number;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
}
