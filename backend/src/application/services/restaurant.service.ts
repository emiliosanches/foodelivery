import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { RestaurantServicePort } from '@/application/ports/in/services/restaurant.service.port';
import { RestaurantRepositoryPort } from '@/application/ports/out/repositories/restaurant.repository.port';
import { CreateRestaurantDto } from '@/application/dtos/restaurant/create-restaurant.dto';
import { UpdateRestaurantDto } from '@/application/dtos/restaurant/update-restaurant.dto';
import { Restaurant } from '@/domain/entities/restaurant.entity';
import { v7 } from 'uuid';

@Injectable()
export class RestaurantService extends RestaurantServicePort {
  constructor(private readonly restaurantRepository: RestaurantRepositoryPort) {
    super();
  }

  async create(
    userId: string,
    restaurantData: CreateRestaurantDto,
  ): Promise<Restaurant> {
    const existingRestaurant =
      await this.restaurantRepository.findByUserId(userId);
    if (existingRestaurant) {
      throw new ConflictException('User already has a restaurant');
    }

    const existingEmail = await this.restaurantRepository.findByEmail(
      restaurantData.email,
    );
    if (existingEmail) {
      throw new ConflictException('Email already in use');
    }

    if (restaurantData.deliveryTimeMin >= restaurantData.deliveryTimeMax) {
      throw new BadRequestException(
        'Minimum delivery time must be less than maximum delivery time',
      );
    }

    return this.restaurantRepository.create({
      id: v7(),
      userId,
      name: restaurantData.name,
      description: restaurantData.description,
      phone: restaurantData.phone,
      email: restaurantData.email,
      imageUrl: restaurantData.imageUrl,
      isActive: true,
      deliveryFee: restaurantData.deliveryFee,
      deliveryTimeMin: restaurantData.deliveryTimeMin,
      deliveryTimeMax: restaurantData.deliveryTimeMax,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async findById(id: string): Promise<Restaurant | null> {
    return this.restaurantRepository.findById(id);
  }

  async findByUserId(userId: string): Promise<Restaurant | null> {
    return this.restaurantRepository.findByUserId(userId);
  }

  async update(
    id: string,
    restaurantData: UpdateRestaurantDto,
  ): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findById(id);
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    if (restaurantData.email && restaurantData.email !== restaurant.email) {
      const existingEmail = await this.restaurantRepository.findByEmail(
        restaurantData.email,
      );
      if (existingEmail) {
        throw new ConflictException('Email already in use');
      }
    }

    const newDeliveryTimeMin =
      restaurantData.deliveryTimeMin ?? restaurant.deliveryTimeMin;
    const newDeliveryTimeMax =
      restaurantData.deliveryTimeMax ?? restaurant.deliveryTimeMax;

    if (newDeliveryTimeMin >= newDeliveryTimeMax) {
      throw new BadRequestException(
        'Minimum delivery time must be less than maximum delivery time',
      );
    }

    const updatedData = {
      ...restaurantData,
      updatedAt: new Date(),
    };

    return this.restaurantRepository.update(id, updatedData);
  }

  async toggleActive(id: string): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findById(id);
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    return this.restaurantRepository.update(id, {
      isActive: !restaurant.isActive,
      updatedAt: new Date(),
    });
  }

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{
    restaurants: Restaurant[];
    total: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const [restaurants, total] = await Promise.all([
      this.restaurantRepository.findAll(skip, limit),
      this.restaurantRepository.count(),
    ]);

    return {
      restaurants,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByCity(
    city: string,
    page = 1,
    limit = 10,
  ): Promise<{
    restaurants: Restaurant[];
    total: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const [restaurants, total] = await Promise.all([
      this.restaurantRepository.findByCity(city, skip, limit),
      this.restaurantRepository.countByCity(city),
    ]);

    return {
      restaurants,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}
