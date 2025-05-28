import { MenuItem } from '@/domain/entities/menu-item.entity';

export abstract class MenuItemRepositoryPort {
  abstract create(menuItem: MenuItem): Promise<MenuItem>;
  abstract findById(id: string): Promise<MenuItem | null>;
  abstract findByIdAndRestaurantId(
    menuItemId: string,
    restaurantId: string,
  ): Promise<MenuItem | null>;
  abstract findByCategoryId(categoryId: string): Promise<MenuItem[]>;
  abstract findByRestaurantId(restaurantId: string): Promise<MenuItem[]>;
  abstract update(
    query: { id: string; restaurantId: string },
    menuItem: Partial<MenuItem>,
  ): Promise<MenuItem>;
  abstract delete(query: { id: string; restaurantId: string }): Promise<void>;
  abstract findByName(
    categoryId: string,
    name: string,
  ): Promise<MenuItem | null>;
}
