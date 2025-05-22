import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CategoryServicePort } from '@/application/ports/in/services/category.service.port';
import { CategoryRepositoryPort } from '@/application/ports/out/repositories/category.repository.port';
import { CreateCategoryDto } from '@/application/dtos/category/create-category.dto';
import { UpdateCategoryDto } from '@/application/dtos/category/update-category.dto';
import { Category } from '@/domain/entities/category.entity';
import { v7 } from 'uuid';

@Injectable()
export class CategoryService extends CategoryServicePort {
  constructor(private readonly categoryRepository: CategoryRepositoryPort) {
    super();
  }

  async create(
    restaurantId: string,
    categoryData: CreateCategoryDto,
  ): Promise<Category> {
    const existingCategory = await this.categoryRepository.findByName(
      restaurantId,
      categoryData.name,
    );
    if (existingCategory) {
      throw new ConflictException(
        'Category name already exists in this restaurant',
      );
    }

    return this.categoryRepository.create({
      id: v7(),
      restaurantId,
      name: categoryData.name,
      description: categoryData.description,
      imageUrl: categoryData.imageUrl,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async findById(id: string): Promise<Category | null> {
    return this.categoryRepository.findById(id);
  }

  async findByRestaurantId(restaurantId: string): Promise<Category[]> {
    return this.categoryRepository.findByRestaurantId(restaurantId);
  }

  async update(id: string, categoryData: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (categoryData.name && categoryData.name !== category.name) {
      const existingCategory = await this.categoryRepository.findByName(
        category.restaurantId,
        categoryData.name,
      );
      if (existingCategory) {
        throw new ConflictException(
          'Category name already exists in this restaurant',
        );
      }
    }

    const updatedData = {
      ...categoryData,
      updatedAt: new Date(),
    };

    return this.categoryRepository.update(id, updatedData);
  }

  async delete(id: string): Promise<void> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.categoryRepository.delete(id);
  }

  async toggleStatus(id: string): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.categoryRepository.update(id, {
      isActive: !category.isActive,
      updatedAt: new Date(),
    });
  }
}
