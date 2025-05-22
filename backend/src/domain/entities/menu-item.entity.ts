export class MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isActive: boolean;
  isAvailable: boolean;
  preparationTimeMin: number;
  createdAt: Date;
  updatedAt: Date;
}
