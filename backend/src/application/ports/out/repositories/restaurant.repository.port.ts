import { Restaurant } from '@/domain/entities/restaurant.entity';

export abstract class RestaurantRepositoryPort {
  abstract create(restaurant: Restaurant): Promise<Restaurant>;
  abstract findById(id: string): Promise<Restaurant | null>;
  abstract findByUserId(userId: string): Promise<Restaurant | null>;
  abstract findByEmail(email: string): Promise<Restaurant | null>;
  abstract update(
    id: string,
    restaurant: Partial<Restaurant>,
  ): Promise<Restaurant>;
  abstract findAll(skip: number, take: number): Promise<Restaurant[]>;
  abstract count(): Promise<number>;
  abstract findByCity(
    city: string,
    skip: number,
    take: number,
  ): Promise<Restaurant[]>;
  abstract countByCity(city: string): Promise<number>;
}
