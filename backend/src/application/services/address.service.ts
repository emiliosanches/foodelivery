import { Injectable, NotFoundException } from '@nestjs/common';
import { AddressServicePort } from '@/application/ports/in/services/address.service.port';
import { AddressRepositoryPort } from '@/application/ports/out/repositories/address.repository.port';
import { CreateAddressDto } from '@/application/dtos/address/create-address.dto';
import { UpdateAddressDto } from '@/application/dtos/address/update-address.dto';
import { Address } from '@/domain/entities/address.entity';
import { v7 } from 'uuid';

@Injectable()
export class AddressService extends AddressServicePort {
  constructor(private readonly addressRepository: AddressRepositoryPort) {
    super();
  }

  async create(userId: string, data: CreateAddressDto): Promise<Address> {
    const existingAddresses = await this.addressRepository.findByUserId(userId);
    const isFirstAddress = existingAddresses.length === 0;

    return await this.addressRepository.create({
      id: v7(),
      userId,
      street: data.street,
      number: data.number,
      complement: data.complement,
      neighborhood: data.neighborhood,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode.replace(/\D/g, ''),
      country: data.country,
      latitude: data.latitude,
      longitude: data.longitude,
      isDefault: isFirstAddress,
      type: data.type || 'OTHER',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async findAllByUser(userId: string): Promise<Address[]> {
    const addresses = await this.addressRepository.findByUserId(userId);

    return addresses.sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  async findById(userId: string, addressId: string): Promise<Address> {
    const address = await this.addressRepository.findById(addressId);

    if (!address || address.userId !== userId) {
      throw new NotFoundException('Endereço não encontrado');
    }

    return address;
  }

  async update(
    userId: string,
    addressId: string,
    data: UpdateAddressDto,
  ): Promise<Address> {
    await this.findById(userId, addressId);

    const updatedData = {
      ...data,
      postalCode: data.postalCode
        ? data.postalCode.replace(/\D/g, '')
        : undefined,
    };

    return await this.addressRepository.update(addressId, updatedData);
  }

  async delete(userId: string, addressId: string): Promise<void> {
    const existingAddress = await this.findById(userId, addressId);

    if (existingAddress.isDefault) {
      const otherAddresses = await this.addressRepository.findByUserId(userId);
      const activeOthers = otherAddresses.filter(
        (addr) => addr.id !== addressId,
      );

      if (activeOthers.length > 0) {
        const newDefault = activeOthers.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
        )[0];
        await this.addressRepository.update(newDefault.id, { isDefault: true });
      }
    }

    await this.addressRepository.delete(addressId);
  }

  async setAsDefault(userId: string, addressId: string): Promise<Address> {
    await this.findById(userId, addressId);

    await this.addressRepository.setDefaultAddress(userId, addressId);

    return await this.addressRepository.findById(addressId)!;
  }
}
