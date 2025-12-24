import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { MenuItemService } from '@/application/services/menu-items.service';
import { MenuItemRepositoryPort } from '@/application/ports/out/repositories/menu-item.repository.port';
import { CategoryRepositoryPort } from '@/application/ports/out/repositories/category.repository.port';
import {
  createMockMenuItemRepository,
  createMockCategoryRepository,
} from '@/test/helpers/mocks';
import { createTestMenuItem } from '@/test/helpers/factories';
import { CreateMenuItemDto } from '@/application/dtos/menu-item/create-menu-item.dto';
import { UpdateMenuItemDto } from '@/application/dtos/menu-item/update-menu-item.dto';

describe('MenuItemService', () => {
  let service: MenuItemService;
  let mockMenuItemRepository: ReturnType<typeof createMockMenuItemRepository>;
  let mockCategoryRepository: ReturnType<typeof createMockCategoryRepository>;

  beforeEach(async () => {
    mockMenuItemRepository = createMockMenuItemRepository();
    mockCategoryRepository = createMockCategoryRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuItemService,
        {
          provide: MenuItemRepositoryPort,
          useValue: mockMenuItemRepository,
        },
        {
          provide: CategoryRepositoryPort,
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<MenuItemService>(MenuItemService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new menu item', async () => {
      // Arrange
      const restaurantId = 'restaurant-1';
      const categoryId = 'category-1';
      const createDto: CreateMenuItemDto = {
        categoryId,
        name: 'Pizza Margherita',
        description: 'Classic pizza',
        price: 25.9,
        imageUrl: 'https://example.com/pizza.jpg',
        preparationTimeMin: 30,
      };

      const category = {
        id: categoryId,
        restaurantId,
        name: 'Pizzas',
        description: 'Pizza menu',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createdMenuItem = createTestMenuItem({
        ...createDto,
        id: 'item-1',
      });

      mockCategoryRepository.findById.mockResolvedValue(category);
      mockMenuItemRepository.findByName.mockResolvedValue(null);
      mockMenuItemRepository.create.mockResolvedValue(createdMenuItem);

      // Act
      const result = await service.create(restaurantId, createDto);

      // Assert
      expect(result).toEqual(createdMenuItem);
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(categoryId);
      expect(mockMenuItemRepository.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if category does not exist', async () => {
      // Arrange
      const createDto: CreateMenuItemDto = {
        categoryId: 'non-existent',
        name: 'Pizza',
        description: 'Pizza',
        price: 25.0,
        preparationTimeMin: 30,
      };

      mockCategoryRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create('restaurant-1', createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if category belongs to another restaurant', async () => {
      // Arrange
      const restaurantId = 'restaurant-1';
      const createDto: CreateMenuItemDto = {
        categoryId: 'category-1',
        name: 'Pizza',
        description: 'Pizza',
        price: 25.0,
        preparationTimeMin: 30,
      };

      const category = {
        id: 'category-1',
        restaurantId: 'restaurant-2', // Different restaurant
        name: 'Pizzas',
        description: 'Pizza menu',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCategoryRepository.findById.mockResolvedValue(category);

      // Act & Assert
      await expect(service.create(restaurantId, createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException if menu item name already exists', async () => {
      // Arrange
      const restaurantId = 'restaurant-1';
      const createDto: CreateMenuItemDto = {
        categoryId: 'category-1',
        name: 'Pizza Margherita',
        description: 'Pizza',
        price: 25.0,
        preparationTimeMin: 30,
      };

      const category = {
        id: 'category-1',
        restaurantId,
        name: 'Pizzas',
        description: 'Pizza menu',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const existingMenuItem = createTestMenuItem({
        name: 'Pizza Margherita',
      });

      mockCategoryRepository.findById.mockResolvedValue(category);
      mockMenuItemRepository.findByName.mockResolvedValue(existingMenuItem);

      // Act & Assert
      await expect(service.create(restaurantId, createDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException if price <= 0', async () => {
      // Arrange
      const restaurantId = 'restaurant-1';
      const createDto: CreateMenuItemDto = {
        categoryId: 'category-1',
        name: 'Free Item',
        description: 'Free item',
        price: 0, // Invalid price
        preparationTimeMin: 30,
      };

      const category = {
        id: 'category-1',
        restaurantId,
        name: 'Pizzas',
        description: 'Pizza menu',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCategoryRepository.findById.mockResolvedValue(category);
      mockMenuItemRepository.findByName.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(restaurantId, createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if preparationTimeMin <= 0', async () => {
      // Arrange
      const restaurantId = 'restaurant-1';
      const createDto: CreateMenuItemDto = {
        categoryId: 'category-1',
        name: 'Instant Pizza',
        description: 'Instant pizza',
        price: 25.0,
        preparationTimeMin: 0, // Invalid preparation time
      };

      const category = {
        id: 'category-1',
        restaurantId,
        name: 'Pizzas',
        description: 'Pizza menu',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCategoryRepository.findById.mockResolvedValue(category);
      mockMenuItemRepository.findByName.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(restaurantId, createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('should update menu item successfully', async () => {
      // Arrange
      const menuItemId = 'item-1';
      const restaurantId = 'restaurant-1';
      const existingMenuItem = createTestMenuItem({
        id: menuItemId,
        name: 'Old Name',
        price: 20.0,
      });
      const updateDto: UpdateMenuItemDto = {
        name: 'New Name',
        price: 25.0,
      };

      mockMenuItemRepository.findById.mockResolvedValue(existingMenuItem);
      mockMenuItemRepository.findByName.mockResolvedValue(null);
      mockMenuItemRepository.update.mockResolvedValue({
        ...existingMenuItem,
        ...updateDto,
      });

      // Act
      const result = await service.update(menuItemId, restaurantId, updateDto);

      // Assert
      expect(result.name).toBe(updateDto.name);
      expect(result.price).toBe(updateDto.price);
    });

    it('should throw NotFoundException if menu item does not exist', async () => {
      // Arrange
      mockMenuItemRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.update('non-existent', 'restaurant-1', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if new price <= 0', async () => {
      // Arrange
      const menuItemId = 'item-1';
      const existingMenuItem = createTestMenuItem({ id: menuItemId });
      const updateDto: UpdateMenuItemDto = { price: -10 };

      mockMenuItemRepository.findById.mockResolvedValue(existingMenuItem);

      // Act & Assert
      await expect(
        service.update(menuItemId, 'restaurant-1', updateDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if new preparationTimeMin <= 0', async () => {
      // Arrange
      const menuItemId = 'item-1';
      const existingMenuItem = createTestMenuItem({ id: menuItemId });
      const updateDto: UpdateMenuItemDto = { preparationTimeMin: -5 };

      mockMenuItemRepository.findById.mockResolvedValue(existingMenuItem);

      // Act & Assert
      await expect(
        service.update(menuItemId, 'restaurant-1', updateDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if new name already exists', async () => {
      // Arrange
      const menuItemId = 'item-1';
      const existingMenuItem = createTestMenuItem({
        id: menuItemId,
        name: 'Old Name',
      });
      const conflictingItem = createTestMenuItem({
        id: 'item-2',
        name: 'New Name',
      });
      const updateDto: UpdateMenuItemDto = { name: 'New Name' };

      mockMenuItemRepository.findById.mockResolvedValue(existingMenuItem);
      mockMenuItemRepository.findByName.mockResolvedValue(conflictingItem);

      // Act & Assert
      await expect(
        service.update(menuItemId, 'restaurant-1', updateDto),
      ).rejects.toThrow(ConflictException);
    });

    it('should allow updating to same name', async () => {
      // Arrange
      const menuItemId = 'item-1';
      const existingMenuItem = createTestMenuItem({
        id: menuItemId,
        name: 'Same Name',
      });
      const updateDto: UpdateMenuItemDto = {
        name: 'Same Name',
        price: 30.0,
      };

      mockMenuItemRepository.findById.mockResolvedValue(existingMenuItem);
      mockMenuItemRepository.update.mockResolvedValue({
        ...existingMenuItem,
        ...updateDto,
      });

      // Act
      const result = await service.update(
        menuItemId,
        'restaurant-1',
        updateDto,
      );

      // Assert
      expect(result.price).toBe(30.0);
      expect(mockMenuItemRepository.findByName).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete menu item successfully', async () => {
      // Arrange
      const menuItemId = 'item-1';
      const restaurantId = 'restaurant-1';
      const existingMenuItem = createTestMenuItem({ id: menuItemId });

      mockMenuItemRepository.findById.mockResolvedValue(existingMenuItem);
      mockMenuItemRepository.delete.mockResolvedValue(undefined);

      // Act
      await service.delete(menuItemId, restaurantId);

      // Assert
      expect(mockMenuItemRepository.delete).toHaveBeenCalledWith({
        id: menuItemId,
        restaurantId,
      });
    });

    it('should throw NotFoundException if menu item does not exist', async () => {
      // Arrange
      mockMenuItemRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.delete('non-existent', 'restaurant-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('toggleActive', () => {
    it('should toggle menu item active status to false', async () => {
      // Arrange
      const menuItemId = 'item-1';
      const restaurantId = 'restaurant-1';
      const activeMenuItem = createTestMenuItem({
        id: menuItemId,
        isActive: true,
      });

      mockMenuItemRepository.findById.mockResolvedValue(activeMenuItem);
      mockMenuItemRepository.update.mockResolvedValue({
        ...activeMenuItem,
        isActive: false,
      });

      // Act
      const result = await service.toggleActive(menuItemId, restaurantId);

      // Assert
      expect(result.isActive).toBe(false);
    });

    it('should toggle menu item active status to true', async () => {
      // Arrange
      const menuItemId = 'item-1';
      const restaurantId = 'restaurant-1';
      const inactiveMenuItem = createTestMenuItem({
        id: menuItemId,
        isActive: false,
      });

      mockMenuItemRepository.findById.mockResolvedValue(inactiveMenuItem);
      mockMenuItemRepository.update.mockResolvedValue({
        ...inactiveMenuItem,
        isActive: true,
      });

      // Act
      const result = await service.toggleActive(menuItemId, restaurantId);

      // Assert
      expect(result.isActive).toBe(true);
    });

    it('should throw NotFoundException if menu item does not exist', async () => {
      // Arrange
      mockMenuItemRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.toggleActive('non-existent', 'restaurant-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('toggleAvailability', () => {
    it('should toggle menu item availability to false', async () => {
      // Arrange
      const menuItemId = 'item-1';
      const restaurantId = 'restaurant-1';
      const availableMenuItem = createTestMenuItem({
        id: menuItemId,
        isAvailable: true,
      });

      mockMenuItemRepository.findById.mockResolvedValue(availableMenuItem);
      mockMenuItemRepository.update.mockResolvedValue({
        ...availableMenuItem,
        isAvailable: false,
      });

      // Act
      const result = await service.toggleAvailability(menuItemId, restaurantId);

      // Assert
      expect(result.isAvailable).toBe(false);
    });

    it('should toggle menu item availability to true', async () => {
      // Arrange
      const menuItemId = 'item-1';
      const restaurantId = 'restaurant-1';
      const unavailableMenuItem = createTestMenuItem({
        id: menuItemId,
        isAvailable: false,
      });

      mockMenuItemRepository.findById.mockResolvedValue(unavailableMenuItem);
      mockMenuItemRepository.update.mockResolvedValue({
        ...unavailableMenuItem,
        isAvailable: true,
      });

      // Act
      const result = await service.toggleAvailability(menuItemId, restaurantId);

      // Assert
      expect(result.isAvailable).toBe(true);
    });
  });

  describe('findById', () => {
    it('should return menu item when found', async () => {
      // Arrange
      const menuItem = createTestMenuItem();
      mockMenuItemRepository.findById.mockResolvedValue(menuItem);

      // Act
      const result = await service.findById(menuItem.id);

      // Assert
      expect(result).toEqual(menuItem);
    });

    it('should return null when not found', async () => {
      // Arrange
      mockMenuItemRepository.findById.mockResolvedValue(null);

      // Act
      const result = await service.findById('non-existent');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findByRestaurantId', () => {
    it('should return all menu items for restaurant', async () => {
      // Arrange
      const restaurantId = 'restaurant-1';
      const menuItems = [
        createTestMenuItem({ id: 'item-1' }),
        createTestMenuItem({ id: 'item-2' }),
      ];
      mockMenuItemRepository.findByRestaurantId.mockResolvedValue(menuItems);

      // Act
      const result = await service.findByRestaurantId(restaurantId);

      // Assert
      expect(result).toEqual(menuItems);
      expect(result).toHaveLength(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle menu item with very long description', async () => {
      // Arrange
      const restaurantId = 'restaurant-1';
      const longDescription = 'A'.repeat(1000);
      const createDto: CreateMenuItemDto = {
        categoryId: 'category-1',
        name: 'Special Item',
        description: longDescription,
        price: 50.0,
        preparationTimeMin: 45,
      };

      const category = {
        id: 'category-1',
        restaurantId,
        name: 'Special',
        description: 'Special items',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCategoryRepository.findById.mockResolvedValue(category);
      mockMenuItemRepository.findByName.mockResolvedValue(null);
      mockMenuItemRepository.create.mockResolvedValue(
        createTestMenuItem({ description: longDescription }),
      );

      // Act
      const result = await service.create(restaurantId, createDto);

      // Assert
      expect(result.description).toHaveLength(1000);
    });

    it('should handle menu item with very high price', async () => {
      // Arrange
      const menuItemId = 'item-1';
      const existingMenuItem = createTestMenuItem({ id: menuItemId });
      const updateDto: UpdateMenuItemDto = {
        price: 9999.99, // Very expensive item
      };

      mockMenuItemRepository.findById.mockResolvedValue(existingMenuItem);
      mockMenuItemRepository.update.mockResolvedValue({
        ...existingMenuItem,
        ...updateDto,
      });

      // Act
      const result = await service.update(
        menuItemId,
        'restaurant-1',
        updateDto,
      );

      // Assert
      expect(result.price).toBe(9999.99);
    });

    it('should handle decimal prices correctly', async () => {
      // Arrange
      const menuItemId = 'item-1';
      const existingMenuItem = createTestMenuItem({ id: menuItemId });
      const updateDto: UpdateMenuItemDto = {
        price: 19.99, // Price with decimals
      };

      mockMenuItemRepository.findById.mockResolvedValue(existingMenuItem);
      mockMenuItemRepository.update.mockResolvedValue({
        ...existingMenuItem,
        ...updateDto,
      });

      // Act
      const result = await service.update(
        menuItemId,
        'restaurant-1',
        updateDto,
      );

      // Assert
      expect(result.price).toBe(19.99);
    });
  });
});

