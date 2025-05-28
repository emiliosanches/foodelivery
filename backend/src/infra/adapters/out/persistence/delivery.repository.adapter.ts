import { DeliveryWithRelations } from '@/application/dtos/delivery/delivery-response.dto';
import { DeliveryRepositoryPort } from '@/application/ports/out/repositories/delivery.repository.port';
import { Delivery } from '@/domain/delivery';
import { PrismaService } from './prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DeliveryRepositoryAdapter extends DeliveryRepositoryPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  create(delivery: Delivery): Promise<Delivery> {
    return this.prisma.delivery.create({
      data: {
        id: delivery.id,
        orderId: delivery.orderId,
        deliveryPersonId: delivery.deliveryPersonId || undefined,
        status: delivery.status,
        currentLatitude: delivery.currentLatitude,
        currentLongitude: delivery.currentLongitude,
        acceptedAt: delivery.acceptedAt,
        pickedUpAt: delivery.pickedUpAt,
        deliveredAt: delivery.deliveredAt,
        createdAt: delivery.createdAt,
        updatedAt: delivery.updatedAt,
      },
    });
  }

  findById(id: string): Promise<Delivery | null> {
    return this.prisma.delivery.findUnique({
      where: { id },
    });
  }

  findByIdAndRestaurantId(
    id: string,
    restaurantId: string,
  ): Promise<Delivery | null> {
    return this.prisma.delivery.findUnique({
      where: {
        id,
        order: {
          restaurantId: restaurantId,
        },
      },
    });
  }

  findByIdAndCustomerId(
    id: string,
    customerId: string,
  ): Promise<Delivery | null> {
    return this.prisma.delivery.findUnique({
      where: {
        id,
        order: {
          customerId: customerId,
        },
      },
    });
  }

  async findByIdWithRelations(
    id: string,
  ): Promise<DeliveryWithRelations | null> {
    const result = await this.prisma.delivery.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
            restaurant: {
              select: {
                id: true,
                name: true,
                address: true,
                phone: true,
              },
            },
            deliveryAddress: {
              select: {
                id: true,
                street: true,
                number: true,
                complement: true,
                neighborhood: true,
                city: true,
                state: true,
                country: true,
                postalCode: true,
                latitude: true,
                longitude: true,
              },
            },
          },
        },
        deliveryPerson: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    return result as DeliveryWithRelations | null;
  }

  async findByOrderId(orderId: string): Promise<Delivery | null> {
    return this.prisma.delivery.findUnique({
      where: { orderId },
    });
  }

  update(id: string, data: Partial<Delivery>): Promise<Delivery> {
    return this.prisma.delivery.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async findByDeliveryPersonId(
    deliveryPersonId: string,
  ): Promise<DeliveryWithRelations[]> {
    const where: any = {
      deliveryPersonId,
    };

    if (status) {
      where.status = status;
    }

    const result = await this.prisma.delivery.findMany({
      where,
      include: {
        order: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
            restaurant: {
              select: {
                id: true,
                name: true,
                address: true,
                phone: true,
              },
            },
            deliveryAddress: {
              select: {
                id: true,
                street: true,
                number: true,
                complement: true,
                neighborhood: true,
                city: true,
                state: true,
                country: true,
                postalCode: true,
                latitude: true,
                longitude: true,
              },
            },
          },
        },
        deliveryPerson: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return result as DeliveryWithRelations[];
  }
}
