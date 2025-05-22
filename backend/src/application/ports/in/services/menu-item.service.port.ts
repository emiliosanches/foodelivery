import { CreateMenuItemDto } from '@/application/dtos/menu-item/create-menu-item.dto';
import { UpdateMenuItemDto } from '@/application/dtos/menu-item/update-menu-item.dto';
import { MenuItem } from '@/domain/entities/menu-item.entity';

export abstract class MenuItemServicePort {
  abstract create(
    categoryId: string,
    menuItemData: CreateMenuItemDto,
  ): Promise<MenuItem>;
  abstract findById(id: string): Promise<MenuItem | null>;
  abstract findByCategoryId(categoryId: string): Promise<MenuItem[]>;
  abstract findByRestaurantId(restaurantId: string): Promise<MenuItem[]>;
  abstract update(
    id: string,
    menuItemData: UpdateMenuItemDto,
  ): Promise<MenuItem>;
  abstract delete(id: string): Promise<void>;
  abstract toggleActive(id: string): Promise<MenuItem>;
  abstract toggleAvailability(id: string): Promise<MenuItem>;
}
