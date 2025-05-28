import { Injectable } from '@nestjs/common';
import { MenuItemRepositoryPort } from '@/application/ports/out/repositories/menu-item.repository.port';
import { MenuItem } from '@/domain/entities/menu-item.entity';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class MenuItemRepositoryAdapter extends MenuItemRepositoryPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(menuItem: MenuItem): Promise<MenuItem> {
    return this.prisma.menuItem.create({
      data: menuItem,
    });
  }

  async findById(id: string): Promise<MenuItem | null> {
    return this.prisma.menuItem.findUnique({
      where: { id },
    });
  }

  async findByIdAndRestaurantId(
    id: string,
    restaurantId: string,
  ): Promise<MenuItem | null> {
    return this.prisma.menuItem.findUnique({
      where: { id, category: { restaurantId } },
    });
  }

  async findByCategoryId(categoryId: string): Promise<MenuItem[]> {
    return this.prisma.menuItem.findMany({
      where: { categoryId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findByRestaurantId(restaurantId: string): Promise<MenuItem[]> {
    return this.prisma.menuItem.findMany({
      where: {
        category: {
          restaurantId,
        },
      },
      include: {
        category: true,
      },
      orderBy: [{ category: { name: 'asc' } }, { createdAt: 'asc' }],
    });
  }

  async update(
    query: { id: string; restaurantId: string },
    menuItem: Partial<MenuItem>,
  ): Promise<MenuItem> {
    return this.prisma.menuItem.update({
      where: {
        id: query.id,
        category: {
          restaurantId: query.restaurantId,
        },
      },
      data: menuItem,
    });
  }

  async delete(query: { id: string; restaurantId: string }): Promise<void> {
    await this.prisma.menuItem.delete({
      where: {
        id: query.id,
        category: {
          restaurantId: query.restaurantId,
        },
      },
    });
  }

  async findByName(categoryId: string, name: string): Promise<MenuItem | null> {
    return this.prisma.menuItem.findFirst({
      where: {
        categoryId,
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });
  }
}
