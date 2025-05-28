import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { AddressRepositoryPort } from '@/application/ports/out/repositories/address.repository.port';
import { Address } from '@/domain/entities/address.entity';

@Injectable()
export class AddressRepositoryAdapter extends AddressRepositoryPort {
  constructor(private prisma: PrismaService) {
    super();
  }

  async create(address: Address): Promise<Address> {
    return this.prisma.address.create({
      data: {
        id: address.id,
        userId: address.userId,
        street: address.street,
        number: address.number,
        complement: address.complement,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        latitude: address.latitude,
        longitude: address.longitude,
        isDefault: address.isDefault,
        type: address.type,
        createdAt: address.createdAt,
        updatedAt: address.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<Address | null> {
    return this.prisma.address.findUnique({
      where: { id },
    });
  }

  async findByUserId(userId: string): Promise<Address[]> {
    return this.prisma.address.findMany({
      where: {
        userId,
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async update(id: string, data: Partial<Address>): Promise<Address> {
    return this.prisma.address.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.address.delete({
      where: { id },
    });
  }

  async findDefaultByUserId(userId: string): Promise<Address | null> {
    return this.prisma.address.findFirst({
      where: {
        userId,
        isDefault: true,
      },
    });
  }

  async setDefaultAddress(userId: string, addressId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.address.findUniqueOrThrow({
        where: {
          id: addressId,
          userId,
        },
      });

      await tx.address.updateMany({
        where: {
          userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
          updatedAt: new Date(),
        },
      });

      await tx.address.update({
        where: { id: addressId },
        data: {
          isDefault: true,
          updatedAt: new Date(),
        },
      });
    });
  }
}
