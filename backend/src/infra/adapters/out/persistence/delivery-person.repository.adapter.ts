import { Injectable } from '@nestjs/common';
import { DeliveryPersonRepositoryPort } from '@/application/ports/out/repositories/delivery-person.repository.port';
import { DeliveryPerson } from '@/domain/delivery-person/entities/delivery-person.entity';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class DeliveryPersonRepositoryAdapter extends DeliveryPersonRepositoryPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(deliveryPerson: DeliveryPerson): Promise<DeliveryPerson> {
    return this.prisma.deliveryPerson.create({
      data: {
        id: deliveryPerson.id,
        userId: deliveryPerson.userId,
        availability: deliveryPerson.availability,
        vehicleType: deliveryPerson.vehicleType,
        vehiclePlate: deliveryPerson.vehiclePlate,
        currentLatitude: deliveryPerson.currentLatitude,
        currentLongitude: deliveryPerson.currentLongitude,
        deliveryRadius: deliveryPerson.deliveryRadius,
        totalDeliveries: deliveryPerson.totalDeliveries,
        rating: deliveryPerson.rating,
        createdAt: deliveryPerson.createdAt,
        updatedAt: deliveryPerson.updatedAt,
        lastOnlineAt: deliveryPerson.lastOnlineAt,
      },
    });
  }

  async findById(id: string): Promise<DeliveryPerson | null> {
    return this.prisma.deliveryPerson.findUnique({
      where: { id },
    });
  }

  async findByUserId(userId: string): Promise<DeliveryPerson | null> {
    return this.prisma.deliveryPerson.findUnique({
      where: { userId },
    });
  }

  async update(
    id: string,
    data: Partial<DeliveryPerson>,
  ): Promise<DeliveryPerson> {
    return this.prisma.deliveryPerson.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async findAvailableInRadius(
    centerLat: number,
    centerLon: number,
    radiusKm: number,
  ): Promise<DeliveryPerson[]> {
    const deliveryPersons = await this.prisma.$queryRaw<DeliveryPerson[]>`
      SELECT *
      FROM delivery_persons
      WHERE availability = 'AVAILABLE'
        AND current_latitude IS NOT NULL
        AND current_longitude IS NOT NULL
        AND (
          6371 * acos(
            cos(radians(${centerLat})) 
            * cos(radians(current_latitude))
            * cos(radians(current_longitude) - radians(${centerLon}))
            + sin(radians(${centerLat}))
            * sin(radians(current_latitude))
          )
        ) <= ${radiusKm}
      ORDER BY (
        6371 * acos(
          cos(radians(${centerLat})) 
          * cos(radians(current_latitude))
          * cos(radians(current_longitude) - radians(${centerLon}))
          + sin(radians(${centerLat}))
          * sin(radians(current_latitude))
        )
      ) ASC
    `;

    return deliveryPersons;
  }
}
