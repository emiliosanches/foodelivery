import { CreateRestaurantDto } from '@/application/dtos/restaurant/create-restaurant.dto';
import { UpdateRestaurantDto } from '@/application/dtos/restaurant/update-restaurant.dto';
import { Restaurant } from '@/domain/entities/restaurant.entity';

export abstract class RestaurantServicePort {
  abstract create(
    userId: string,
    restaurantData: CreateRestaurantDto,
  ): Promise<Restaurant>;
  abstract findById(id: string): Promise<Restaurant | null>;
  abstract findByUserId(userId: string): Promise<Restaurant | null>;
  abstract update(
    id: string,
    restaurantData: UpdateRestaurantDto,
  ): Promise<Restaurant>;
  abstract toggleActive(id: string): Promise<Restaurant>;
  abstract findAll(
    page?: number,
    limit?: number,
  ): Promise<{
    restaurants: Restaurant[];
    total: number;
    totalPages: number;
  }>;
  abstract findByCity(
    city: string,
    page?: number,
    limit?: number,
  ): Promise<{
    restaurants: Restaurant[];
    total: number;
    totalPages: number;
  }>;
}
