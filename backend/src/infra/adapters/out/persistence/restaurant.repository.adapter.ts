import { Injectable } from '@nestjs/common';
import { RestaurantRepositoryPort } from '@/application/ports/out/repositories/restaurant.repository.port';
import { Restaurant } from '@/domain/entities/restaurant.entity';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class RestaurantRepositoryAdapter extends RestaurantRepositoryPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(restaurant: Restaurant): Promise<Restaurant> {
    return this.prisma.restaurant.create({
      data: restaurant,
    });
  }

  async findById(id: string): Promise<Restaurant | null> {
    return this.prisma.restaurant.findUnique({
      where: { id },
    });
  }

  async findByUserId(userId: string): Promise<Restaurant | null> {
    return this.prisma.restaurant.findUnique({
      where: { userId },
    });
  }

  async findByEmail(email: string): Promise<Restaurant | null> {
    return this.prisma.restaurant.findUnique({
      where: { email },
    });
  }

  async update(
    id: string,
    restaurant: Partial<Restaurant>,
  ): Promise<Restaurant> {
    return this.prisma.restaurant.update({
      where: { id },
      data: restaurant,
    });
  }

  async findAll(skip: number, take: number): Promise<Restaurant[]> {
    return this.prisma.restaurant.findMany({
      skip,
      take,
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async count(): Promise<number> {
    return this.prisma.restaurant.count({
      where: { isActive: true },
    });
  }

  async findByCity(
    city: string,
    skip: number,
    take: number,
  ): Promise<Restaurant[]> {
    return this.prisma.restaurant.findMany({
      skip,
      take,
      where: {
        isActive: true,
        addresses: {
          some: {
            city: {
              contains: city,
              mode: 'insensitive',
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async countByCity(city: string): Promise<number> {
    return this.prisma.restaurant.count({
      where: {
        isActive: true,
        addresses: {
          some: {
            city: {
              contains: city,
              mode: 'insensitive',
            },
          },
        },
      },
    });
  }
}
