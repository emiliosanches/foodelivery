import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { MenuItemServicePort } from '@/application/ports/in/services/menu-item.service.port';
import { MenuItemRepositoryPort } from '@/application/ports/out/repositories/menu-item.repository.port';
import { CreateMenuItemDto } from '@/application/dtos/menu-item/create-menu-item.dto';
import { UpdateMenuItemDto } from '@/application/dtos/menu-item/update-menu-item.dto';
import { MenuItem } from '@/domain/entities/menu-item.entity';
import { v7 } from 'uuid';

@Injectable()
export class MenuItemService extends MenuItemServicePort {
  constructor(private readonly menuItemRepository: MenuItemRepositoryPort) {
    super();
  }

  async create(
    categoryId: string,
    menuItemData: CreateMenuItemDto,
  ): Promise<MenuItem> {
    const existingMenuItem = await this.menuItemRepository.findByName(
      categoryId,
      menuItemData.name,
    );
    if (existingMenuItem) {
      throw new ConflictException(
        'Menu item name already exists in this category',
      );
    }

    if (menuItemData.price <= 0) {
      throw new BadRequestException('Price must be greater than zero');
    }

    if (menuItemData.preparationTimeMin <= 0) {
      throw new BadRequestException(
        'Preparation time must be greater than zero',
      );
    }

    return this.menuItemRepository.create({
      id: v7(),
      categoryId,
      name: menuItemData.name,
      description: menuItemData.description,
      price: menuItemData.price,
      imageUrl: menuItemData.imageUrl,
      isActive: true,
      isAvailable: true,
      preparationTimeMin: menuItemData.preparationTimeMin,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async findById(id: string): Promise<MenuItem | null> {
    return this.menuItemRepository.findById(id);
  }

  async findByCategoryId(categoryId: string): Promise<MenuItem[]> {
    return this.menuItemRepository.findByCategoryId(categoryId);
  }

  async findByRestaurantId(restaurantId: string): Promise<MenuItem[]> {
    return this.menuItemRepository.findByRestaurantId(restaurantId);
  }

  async update(id: string, menuItemData: UpdateMenuItemDto): Promise<MenuItem> {
    const menuItem = await this.menuItemRepository.findById(id);
    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    if (menuItemData.price !== undefined && menuItemData.price <= 0) {
      throw new BadRequestException('Price must be greater than zero');
    }

    if (
      menuItemData.preparationTimeMin !== undefined &&
      menuItemData.preparationTimeMin <= 0
    ) {
      throw new BadRequestException(
        'Preparation time must be greater than zero',
      );
    }

    if (menuItemData.name && menuItemData.name !== menuItem.name) {
      const existingMenuItem = await this.menuItemRepository.findByName(
        menuItem.categoryId,
        menuItemData.name,
      );
      if (existingMenuItem) {
        throw new ConflictException(
          'Menu item name already exists in this category',
        );
      }
    }

    const updatedData = {
      ...menuItemData,
      updatedAt: new Date(),
    };

    return this.menuItemRepository.update(id, updatedData);
  }

  async delete(id: string): Promise<void> {
    const menuItem = await this.menuItemRepository.findById(id);
    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    await this.menuItemRepository.delete(id);
  }

  async toggleActive(id: string): Promise<MenuItem> {
    const menuItem = await this.menuItemRepository.findById(id);
    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    return this.menuItemRepository.update(id, {
      isActive: !menuItem.isActive,
      updatedAt: new Date(),
    });
  }

  async toggleAvailability(id: string): Promise<MenuItem> {
    const menuItem = await this.menuItemRepository.findById(id);
    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    return this.menuItemRepository.update(id, {
      isAvailable: !menuItem.isAvailable,
      updatedAt: new Date(),
    });
  }
}
