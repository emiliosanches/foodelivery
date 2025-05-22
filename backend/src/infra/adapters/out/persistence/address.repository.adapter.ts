import { Injectable } from '@nestjs/common';
import { AddressRepositoryPort } from '@/application/ports/out/repositories/address.repository.port';
import { Address } from '@/domain/entities/address.entity';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AddressRepositoryAdapter extends AddressRepositoryPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(address: Address): Promise<Address> {
    return this.prisma.address.create({
      data: address,
    });
  }

  async findById(id: string): Promise<Address | null> {
    return this.prisma.address.findUnique({
      where: { id },
    });
  }

  async findByUserId(userId: string): Promise<Address[]> {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findByRestaurantId(restaurantId: string): Promise<Address[]> {
    return this.prisma.address.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, address: Partial<Address>): Promise<Address> {
    return this.prisma.address.update({
      where: { id },
      data: address,
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
    await this.prisma.$transaction([
      this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      }),
      this.prisma.address.update({
        where: { id: addressId },
        data: { isDefault: true },
      }),
    ]);
  }
}
