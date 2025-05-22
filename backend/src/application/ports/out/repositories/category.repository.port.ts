import { Category } from '@/domain/entities/category.entity';

export abstract class CategoryRepositoryPort {
  abstract create(category: Category): Promise<Category>;
  abstract findById(id: string): Promise<Category | null>;
  abstract findByRestaurantId(restaurantId: string): Promise<Category[]>;
  abstract update(id: string, category: Partial<Category>): Promise<Category>;
  abstract delete(id: string): Promise<void>;
  abstract findByName(
    restaurantId: string,
    name: string,
  ): Promise<Category | null>;
}
