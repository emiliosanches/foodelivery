import { CreateAddressDto } from '@/application/dtos/address/create-address.dto';
import { UpdateAddressDto } from '@/application/dtos/address/update-address.dto';
import { Address } from '@/domain/entities/address.entity';

export abstract class AddressServicePort {
  abstract create(userId: string, data: CreateAddressDto): Promise<Address>;
  abstract findAllByUser(userId: string): Promise<Address[]>;
  abstract findById(userId: string, addressId: string): Promise<Address>;
  abstract update(
    userId: string,
    addressId: string,
    data: UpdateAddressDto,
  ): Promise<Address>;
  abstract delete(userId: string, addressId: string): Promise<void>;
  abstract setAsDefault(userId: string, addressId: string): Promise<Address>;
}
