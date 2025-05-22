export class CreateMenuItemDto {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  preparationTimeMin: number;
}
