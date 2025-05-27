import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DeliveryPersonServicePort } from '@/application/ports/in/services/delivery-person.service.port';
import { DeliveryPersonRepositoryPort } from '@/application/ports/out/repositories/delivery-person.repository.port';
import { CreateDeliveryPersonDto } from '@/application/dtos/delivery-person/create-delivery-person.dto';
import { UpdateDeliveryPersonDto } from '@/application/dtos/delivery-person/update-delivery-person.dto';
import {
  DeliveryPerson,
  DeliveryPersonAvailability,
} from '@/domain/delivery-person/entities/delivery-person.entity';
import { v7 } from 'uuid';

@Injectable()
export class DeliveryPersonService extends DeliveryPersonServicePort {
  constructor(
    private readonly deliveryPersonRepository: DeliveryPersonRepositoryPort,
  ) {
    super();
  }

  async create(
    userId: string,
    data: CreateDeliveryPersonDto,
  ): Promise<DeliveryPerson> {
    const existingDeliveryPerson =
      await this.deliveryPersonRepository.findByUserId(userId);

    if (existingDeliveryPerson) {
      throw new ConflictException('User already has a delivery person profile');
    }

    return this.deliveryPersonRepository.create({
      id: v7(),
      userId,
      availability: 'OFFLINE',
      vehicleType: data.vehicleType,
      vehiclePlate: data.vehiclePlate,
      currentLatitude: undefined,
      currentLongitude: undefined,
      deliveryRadius: data.deliveryRadius || 5.0,
      totalDeliveries: 0,
      rating: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastOnlineAt: undefined,
    });
  }

  async findById(id: string): Promise<DeliveryPerson> {
    const deliveryPerson = await this.deliveryPersonRepository.findById(id);

    if (!deliveryPerson) {
      throw new NotFoundException('Delivery person not found');
    }

    return deliveryPerson;
  }

  async findByUserId(userId: string): Promise<DeliveryPerson | null> {
    return this.deliveryPersonRepository.findByUserId(userId);
  }

  async update(
    id: string,
    data: UpdateDeliveryPersonDto,
  ): Promise<DeliveryPerson> {
    await this.findById(id);

    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    return this.deliveryPersonRepository.update(id, updateData);
  }

  async updateLocation(
    id: string,
    latitude: number,
    longitude: number,
  ): Promise<DeliveryPerson> {
    const deliveryPerson = await this.findById(id);

    const updateData = {
      currentLatitude: latitude,
      currentLongitude: longitude,
      lastOnlineAt: new Date(),
      updatedAt: new Date(),
    };

    return this.deliveryPersonRepository.update(deliveryPerson.id, updateData);
  }

  private async updateAvailability(
    id: string,
    availability: DeliveryPersonAvailability,
  ): Promise<DeliveryPerson> {
    const updateData = {
      availability,
      updatedAt: new Date(),
      ...(availability === 'OFFLINE' && { lastOnlineAt: new Date() }),
    };

    return this.deliveryPersonRepository.update(id, updateData);
  }

  async goOnline(id: string): Promise<DeliveryPerson> {
    const deliveryPerson = await this.findById(id);

    if (deliveryPerson.availability === 'BUSY') {
      throw new BadRequestException('You are currently working on a delivery');
    }

    return this.updateAvailability(id, 'AVAILABLE');
  }

  async goOffline(id: string): Promise<DeliveryPerson> {
    const deliveryPerson = await this.findById(id);

    if (deliveryPerson.availability === 'BUSY') {
      throw new BadRequestException('You are currently working on a delivery');
    }

    return this.updateAvailability(id, 'OFFLINE');
  }

  async startDelivery(id: string) {
    const deliveryPerson = await this.findById(id);

    if (deliveryPerson.availability === 'BUSY') {
      throw new BadRequestException('You are already working on a delivery');
    }

    return this.updateAvailability(id, 'AVAILABLE');
  }

  finishDelivery(id: string) {
    return this.updateAvailability(id, 'AVAILABLE');
  }

  async findAvailableNearby(
    restaurantLat: number,
    restaurantLon: number,
    maxRadius: number = 20,
  ): Promise<DeliveryPerson[]> {
    return this.deliveryPersonRepository.findAvailableInRadius(
      restaurantLat,
      restaurantLon,
      maxRadius,
    );
  }
}
