import { CreateCategoryDto } from '@/application/dtos/category/create-category.dto';
import { UpdateCategoryDto } from '@/application/dtos/category/update-category.dto';
import { Category } from '@/domain/entities/category.entity';

export abstract class CategoryServicePort {
  abstract create(
    restaurantId: string,
    categoryData: CreateCategoryDto,
  ): Promise<Category>;
  abstract findById(id: string): Promise<Category | null>;
  abstract findByRestaurantId(restaurantId: string): Promise<Category[]>;
  abstract update(
    id: string,
    categoryData: UpdateCategoryDto,
  ): Promise<Category>;
  abstract delete(id: string): Promise<void>;
  abstract toggleStatus(id: string): Promise<Category>;
}
