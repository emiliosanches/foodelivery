import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { RestaurantService } from '@/application/services/restaurant.service';
import { RestaurantRepositoryPort } from '@/application/ports/out/repositories/restaurant.repository.port';
import { createMockRestaurantRepository } from '@/test/helpers/mocks';
import { createTestRestaurant } from '@/test/helpers/factories';
import { CreateRestaurantDto } from '@/application/dtos/restaurant/create-restaurant.dto';
import { UpdateRestaurantDto } from '@/application/dtos/restaurant/update-restaurant.dto';

describe('RestaurantService', () => {
  let service: RestaurantService;
  let mockRestaurantRepository: ReturnType<
    typeof createMockRestaurantRepository
  >;

  beforeEach(async () => {
    mockRestaurantRepository = createMockRestaurantRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantService,
        {
          provide: RestaurantRepositoryPort,
          useValue: mockRestaurantRepository,
        },
      ],
    }).compile();

    service = module.get<RestaurantService>(RestaurantService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new restaurant', async () => {
      // Arrange
      const userId = 'user-1';
      const createDto: CreateRestaurantDto = {
        name: 'Test Restaurant',
        description: 'A test restaurant',
        phone: '11987654321',
        email: 'restaurant@test.com',
        imageUrl: 'https://example.com/image.jpg',
        deliveryFee: 5.0,
        deliveryTimeMin: 20,
        deliveryTimeMax: 40,
        address: {
          street: 'Test Street',
          number: '123',
          neighborhood: 'Test Neighborhood',
          city: 'Test City',
          state: 'TS',
          postalCode: '12345-678',
          country: 'BR',
          latitude: -23.5505,
          longitude: -46.6333,
        },
      };

      const createdRestaurant = createTestRestaurant({
        userId,
        ...createDto,
      });

      mockRestaurantRepository.findByUserId.mockResolvedValue(null);
      mockRestaurantRepository.findByEmail.mockResolvedValue(null);
      mockRestaurantRepository.create.mockResolvedValue(createdRestaurant);

      // Act
      const result = await service.create(userId, createDto);

      // Assert
      expect(result).toEqual(createdRestaurant);
      expect(mockRestaurantRepository.findByUserId).toHaveBeenCalledWith(
        userId,
      );
      expect(mockRestaurantRepository.findByEmail).toHaveBeenCalledWith(
        createDto.email,
      );
      expect(mockRestaurantRepository.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if user already has a restaurant', async () => {
      // Arrange
      const userId = 'user-1';
      const existingRestaurant = createTestRestaurant({ userId });
      const createDto: CreateRestaurantDto = {
        name: 'Test Restaurant',
        description: 'A test restaurant',
        phone: '11987654321',
        email: 'restaurant@test.com',
        imageUrl: 'https://example.com/image.jpg',
        deliveryFee: 5.0,
        deliveryTimeMin: 20,
        deliveryTimeMax: 40,
        address: {
          street: 'Test Street',
          number: '123',
          neighborhood: 'Test Neighborhood',
          city: 'Test City',
          state: 'TS',
          postalCode: '12345-678',
          country: 'BR',
          latitude: -23.5505,
          longitude: -46.6333,
        },
      };

      mockRestaurantRepository.findByUserId.mockResolvedValue(
        existingRestaurant,
      );

      // Act & Assert
      await expect(service.create(userId, createDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockRestaurantRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if email already in use', async () => {
      // Arrange
      const userId = 'user-1';
      const existingRestaurant = createTestRestaurant({
        email: 'restaurant@test.com',
      });
      const createDto: CreateRestaurantDto = {
        name: 'Test Restaurant',
        description: 'A test restaurant',
        phone: '11987654321',
        email: 'restaurant@test.com',
        imageUrl: 'https://example.com/image.jpg',
        deliveryFee: 5.0,
        deliveryTimeMin: 20,
        deliveryTimeMax: 40,
        address: {
          street: 'Test Street',
          number: '123',
          neighborhood: 'Test Neighborhood',
          city: 'Test City',
          state: 'TS',
          postalCode: '12345-678',
          country: 'BR',
          latitude: -23.5505,
          longitude: -46.6333,
        },
      };

      mockRestaurantRepository.findByUserId.mockResolvedValue(null);
      mockRestaurantRepository.findByEmail.mockResolvedValue(
        existingRestaurant,
      );

      // Act & Assert
      await expect(service.create(userId, createDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockRestaurantRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if deliveryTimeMin >= deliveryTimeMax', async () => {
      // Arrange
      const userId = 'user-1';
      const createDto: CreateRestaurantDto = {
        name: 'Test Restaurant',
        description: 'A test restaurant',
        phone: '11987654321',
        email: 'restaurant@test.com',
        imageUrl: 'https://example.com/image.jpg',
        deliveryFee: 5.0,
        deliveryTimeMin: 40, // Invalid: min >= max
        deliveryTimeMax: 40,
        address: {
          street: 'Test Street',
          number: '123',
          neighborhood: 'Test Neighborhood',
          city: 'Test City',
          state: 'TS',
          postalCode: '12345-678',
          country: 'BR',
          latitude: -23.5505,
          longitude: -46.6333,
        },
      };

      mockRestaurantRepository.findByUserId.mockResolvedValue(null);
      mockRestaurantRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(userId, createDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockRestaurantRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update restaurant successfully', async () => {
      // Arrange
      const restaurantId = 'restaurant-1';
      const existingRestaurant = createTestRestaurant({ id: restaurantId });
      const updateDto: UpdateRestaurantDto = {
        name: 'Updated Restaurant',
        deliveryFee: 7.5,
      };

      mockRestaurantRepository.findById.mockResolvedValue(existingRestaurant);
      mockRestaurantRepository.update.mockResolvedValue({
        ...existingRestaurant,
        ...updateDto,
      });

      // Act
      const result = await service.update(restaurantId, updateDto);

      // Assert
      expect(result.name).toBe(updateDto.name);
      expect(result.deliveryFee).toBe(updateDto.deliveryFee);
      expect(mockRestaurantRepository.update).toHaveBeenCalledWith(
        restaurantId,
        expect.objectContaining(updateDto),
      );
    });

    it('should throw NotFoundException if restaurant does not exist', async () => {
      // Arrange
      const restaurantId = 'non-existent';
      const updateDto: UpdateRestaurantDto = { name: 'Updated' };

      mockRestaurantRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(restaurantId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if new email is already in use', async () => {
      // Arrange
      const restaurantId = 'restaurant-1';
      const existingRestaurant = createTestRestaurant({
        id: restaurantId,
        email: 'old@test.com',
      });
      const anotherRestaurant = createTestRestaurant({
        id: 'restaurant-2',
        email: 'new@test.com',
      });
      const updateDto: UpdateRestaurantDto = { email: 'new@test.com' };

      mockRestaurantRepository.findById.mockResolvedValue(existingRestaurant);
      mockRestaurantRepository.findByEmail.mockResolvedValue(anotherRestaurant);

      // Act & Assert
      await expect(service.update(restaurantId, updateDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException if deliveryTimeMin >= deliveryTimeMax', async () => {
      // Arrange
      const restaurantId = 'restaurant-1';
      const existingRestaurant = createTestRestaurant({
        id: restaurantId,
        deliveryTimeMin: 20,
        deliveryTimeMax: 40,
      });
      const updateDto: UpdateRestaurantDto = {
        deliveryTimeMin: 50, // Invalid when combined with existing max
      };

      mockRestaurantRepository.findById.mockResolvedValue(existingRestaurant);

      // Act & Assert
      await expect(service.update(restaurantId, updateDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('toggleActive', () => {
    it('should toggle restaurant active status to false', async () => {
      // Arrange
      const restaurantId = 'restaurant-1';
      const activeRestaurant = createTestRestaurant({
        id: restaurantId,
        isActive: true,
      });

      mockRestaurantRepository.findById.mockResolvedValue(activeRestaurant);
      mockRestaurantRepository.update.mockResolvedValue({
        ...activeRestaurant,
        isActive: false,
      });

      // Act
      const result = await service.toggleActive(restaurantId);

      // Assert
      expect(result.isActive).toBe(false);
      expect(mockRestaurantRepository.update).toHaveBeenCalledWith(
        restaurantId,
        expect.objectContaining({ isActive: false }),
      );
    });

    it('should toggle restaurant active status to true', async () => {
      // Arrange
      const restaurantId = 'restaurant-1';
      const inactiveRestaurant = createTestRestaurant({
        id: restaurantId,
        isActive: false,
      });

      mockRestaurantRepository.findById.mockResolvedValue(inactiveRestaurant);
      mockRestaurantRepository.update.mockResolvedValue({
        ...inactiveRestaurant,
        isActive: true,
      });

      // Act
      const result = await service.toggleActive(restaurantId);

      // Assert
      expect(result.isActive).toBe(true);
    });

    it('should throw NotFoundException if restaurant does not exist', async () => {
      // Arrange
      mockRestaurantRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.toggleActive('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findById', () => {
    it('should return restaurant when found', async () => {
      // Arrange
      const restaurant = createTestRestaurant();
      mockRestaurantRepository.findById.mockResolvedValue(restaurant);

      // Act
      const result = await service.findById(restaurant.id);

      // Assert
      expect(result).toEqual(restaurant);
    });

    it('should return null when not found', async () => {
      // Arrange
      mockRestaurantRepository.findById.mockResolvedValue(null);

      // Act
      const result = await service.findById('non-existent');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should return restaurant for user', async () => {
      // Arrange
      const userId = 'user-1';
      const restaurant = createTestRestaurant({ userId });
      mockRestaurantRepository.findByUserId.mockResolvedValue(restaurant);

      // Act
      const result = await service.findByUserId(userId);

      // Assert
      expect(result).toEqual(restaurant);
    });
  });

  describe('findAll', () => {
    it('should return paginated restaurants', async () => {
      // Arrange
      const restaurants = [
        createTestRestaurant({ id: 'r1' }),
        createTestRestaurant({ id: 'r2' }),
      ];
      mockRestaurantRepository.findAll.mockResolvedValue(restaurants);
      mockRestaurantRepository.count.mockResolvedValue(20);

      // Act
      const result = await service.findAll(1, 10);

      // Assert
      expect(result.restaurants).toEqual(restaurants);
      expect(result.total).toBe(20);
      expect(result.totalPages).toBe(2);
      expect(mockRestaurantRepository.findAll).toHaveBeenCalledWith(0, 10);
    });

    it('should calculate correct skip for page 2', async () => {
      // Arrange
      mockRestaurantRepository.findAll.mockResolvedValue([]);
      mockRestaurantRepository.count.mockResolvedValue(0);

      // Act
      await service.findAll(2, 10);

      // Assert
      expect(mockRestaurantRepository.findAll).toHaveBeenCalledWith(10, 10);
    });
  });

  describe('findByCity', () => {
    it('should return restaurants filtered by city', async () => {
      // Arrange
      const city = 'São Paulo';
      const restaurants = [createTestRestaurant()];
      mockRestaurantRepository.findByCity.mockResolvedValue(restaurants);
      mockRestaurantRepository.countByCity.mockResolvedValue(5);

      // Act
      const result = await service.findByCity(city, 1, 10);

      // Assert
      expect(result.restaurants).toEqual(restaurants);
      expect(result.total).toBe(5);
      expect(mockRestaurantRepository.findByCity).toHaveBeenCalledWith(
        city,
        0,
        10,
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle restaurant with minimum delivery time of 0', async () => {
      // Arrange
      const userId = 'user-1';
      const createDto: CreateRestaurantDto = {
        name: 'Fast Restaurant',
        description: 'Very fast delivery',
        phone: '11987654321',
        email: 'fast@test.com',
        imageUrl: 'https://example.com/image.jpg',
        deliveryFee: 0,
        deliveryTimeMin: 0, // Minimum possible
        deliveryTimeMax: 10,
        address: {
          street: 'Test Street',
          number: '123',
          neighborhood: 'Test Neighborhood',
          city: 'Test City',
          state: 'TS',
          postalCode: '12345-678',
          country: 'BR',
          latitude: -23.5505,
          longitude: -46.6333,
        },
      };

      mockRestaurantRepository.findByUserId.mockResolvedValue(null);
      mockRestaurantRepository.findByEmail.mockResolvedValue(null);
      mockRestaurantRepository.create.mockResolvedValue(
        createTestRestaurant(createDto),
      );

      // Act
      const result = await service.create(userId, createDto);

      // Assert
      expect(result.deliveryTimeMin).toBe(0);
      expect(mockRestaurantRepository.create).toHaveBeenCalled();
    });

    it('should handle very high delivery fee', async () => {
      // Arrange
      const restaurantId = 'restaurant-1';
      const existingRestaurant = createTestRestaurant({ id: restaurantId });
      const updateDto: UpdateRestaurantDto = {
        deliveryFee: 999.99, // Very high fee
      };

      mockRestaurantRepository.findById.mockResolvedValue(existingRestaurant);
      mockRestaurantRepository.update.mockResolvedValue({
        ...existingRestaurant,
        ...updateDto,
      });

      // Act
      const result = await service.update(restaurantId, updateDto);

      // Assert
      expect(result.deliveryFee).toBe(999.99);
    });

    it('should allow email update to same email', async () => {
      // Arrange
      const restaurantId = 'restaurant-1';
      const existingRestaurant = createTestRestaurant({
        id: restaurantId,
        email: 'same@test.com',
      });
      const updateDto: UpdateRestaurantDto = {
        email: 'same@test.com', // Same email
        name: 'Updated Name',
      };

      mockRestaurantRepository.findById.mockResolvedValue(existingRestaurant);
      mockRestaurantRepository.update.mockResolvedValue({
        ...existingRestaurant,
        ...updateDto,
      });

      // Act
      const result = await service.update(restaurantId, updateDto);

      // Assert
      expect(result.name).toBe('Updated Name');
      expect(mockRestaurantRepository.findByEmail).not.toHaveBeenCalled();
    });
  });
});

