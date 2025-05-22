import { Injectable } from '@nestjs/common';
import { CategoryRepositoryPort } from '@/application/ports/out/repositories/category.repository.port';
import { Category } from '@/domain/entities/category.entity';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class CategoryRepositoryAdapter extends CategoryRepositoryPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(category: Category): Promise<Category> {
    return this.prisma.category.create({
      data: category,
    });
  }

  async findById(id: string): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: { id },
    });
  }

  async findByRestaurantId(restaurantId: string): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async update(id: string, category: Partial<Category>): Promise<Category> {
    return this.prisma.category.update({
      where: { id },
      data: category,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({
      where: { id },
    });
  }

  async findByName(
    restaurantId: string,
    name: string,
  ): Promise<Category | null> {
    return this.prisma.category.findFirst({
      where: {
        restaurantId,
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });
  }
}
