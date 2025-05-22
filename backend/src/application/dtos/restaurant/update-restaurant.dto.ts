export class UpdateRestaurantDto {
  name?: string;
  description?: string;
  phone?: string;
  email?: string;
  imageUrl?: string;
  isActive?: boolean;
  deliveryFee?: number;
  deliveryTimeMin?: number;
  deliveryTimeMax?: number;
}
