import { Address } from '@/domain/entities/address.entity';

export abstract class AddressRepositoryPort {
  abstract create(address: Address): Promise<Address>;
  abstract findById(id: string): Promise<Address | null>;
  abstract findByUserId(userId: string): Promise<Address[]>;
  abstract update(id: string, address: Partial<Address>): Promise<Address>;
  abstract delete(id: string): Promise<void>;
  abstract findDefaultByUserId(userId: string): Promise<Address | null>;
  abstract setDefaultAddress(userId: string, addressId: string): Promise<void>;
}
