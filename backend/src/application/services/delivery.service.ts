import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { DeliveryServicePort } from '@/application/ports/in/services/delivery.service.port';
import { DeliveryRepositoryPort } from '@/application/ports/out/repositories/delivery.repository.port';
import { DeliveryPersonRepositoryPort } from '@/application/ports/out/repositories/delivery-person.repository.port';
import {
  Delivery,
  DeliveryStatus,
} from '@/domain/delivery/entities/delivery.entity';
import {
  DeliveryWithRelations,
  DeliveryWithRelationsAndEstimate,
} from '@/application/dtos/delivery/delivery-response.dto';
import { v7 } from 'uuid';

@Injectable()
export class DeliveryService extends DeliveryServicePort {
  constructor(
    private readonly deliveryRepository: DeliveryRepositoryPort,
    private readonly deliveryPersonRepository: DeliveryPersonRepositoryPort,
  ) {
    super();
  }

  async createDelivery(orderId: string): Promise<Delivery> {
    const existingDelivery =
      await this.deliveryRepository.findByOrderId(orderId);

    if (existingDelivery) {
      throw new BadRequestException('Delivery already exists for this order');
    }

    return this.deliveryRepository.create({
      id: v7(),
      orderId,
      deliveryPersonId: null,
      status: 'PENDING',
      currentLatitude: undefined,
      currentLongitude: undefined,
      acceptedAt: undefined,
      pickedUpAt: undefined,
      deliveredAt: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async acceptDelivery(
    deliveryId: string,
    deliveryPersonId: string,
  ): Promise<Delivery> {
    const delivery = await this.deliveryRepository.findById(deliveryId);

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    if (delivery.status !== 'PENDING') {
      throw new BadRequestException('Delivery is no longer available');
    }

    const deliveryPerson =
      await this.deliveryPersonRepository.findById(deliveryPersonId);

    if (!deliveryPerson) {
      throw new NotFoundException('Delivery person not found');
    }

    if (deliveryPerson.availability !== 'AVAILABLE') {
      throw new BadRequestException('Delivery person is not available');
    }

    await this.deliveryPersonRepository.update(deliveryPersonId, {
      availability: 'BUSY',
      updatedAt: new Date(),
    });

    return this.deliveryRepository.update(deliveryId, {
      status: 'ACCEPTED',
      deliveryPersonId: deliveryPersonId,
      updatedAt: new Date(),
      acceptedAt: new Date(),
    });
  }

  async updateDeliveryStatus(
    deliveryId: string,
    deliveryPersonId: string,
    status: DeliveryStatus,
  ): Promise<Delivery> {
    const delivery = await this.deliveryRepository.findById(deliveryId);

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    if (delivery.deliveryPersonId !== deliveryPersonId) {
      throw new ForbiddenException('You are not assigned to this delivery');
    }

    this.validateStatusTransition(delivery.status, status);

    const updateData: Partial<Delivery> = {
      status,
      updatedAt: new Date(),
    };

    switch (status) {
      case 'PICKED_UP':
        updateData.pickedUpAt = new Date();
        break;
      case 'DELIVERED':
        updateData.deliveredAt = new Date();
        await this.deliveryPersonRepository.update(deliveryPersonId, {
          availability: 'AVAILABLE',
          updatedAt: new Date(),
        });
        break;
    }

    return this.deliveryRepository.update(deliveryId, updateData);
  }

  async updateDeliveryLocation(
    deliveryId: string,
    deliveryPersonId: string,
    latitude: number,
    longitude: number,
  ): Promise<Delivery> {
    const delivery = await this.deliveryRepository.findById(deliveryId);

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    if (delivery.deliveryPersonId !== deliveryPersonId) {
      throw new ForbiddenException('You are not assigned to this delivery');
    }

    if (delivery.status === 'PENDING' || delivery.status === 'DELIVERED') {
      throw new BadRequestException(
        'Cannot update location for this delivery status',
      );
    }

    const updateData = {
      currentLatitude: latitude,
      currentLongitude: longitude,
      updatedAt: new Date(),
    };

    return this.deliveryRepository.update(deliveryId, updateData);
  }

  async getDeliveriesByDeliveryPerson(
    deliveryPersonId: string,
  ): Promise<DeliveryWithRelations[]> {
    const deliveries =
      await this.deliveryRepository.findByDeliveryPersonId(deliveryPersonId);

    return deliveries;
  }

  async getDeliveryById(
    deliveryId: string,
    deliveryPersonId: string,
  ): Promise<DeliveryWithRelationsAndEstimate> {
    const delivery =
      await this.deliveryRepository.findByIdWithRelations(deliveryId);

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    if (delivery.deliveryPersonId !== deliveryPersonId) {
      throw new ForbiddenException('You are not assigned to this delivery');
    }

    return {
      ...delivery,
      estimateDeliveryTime: this.calculateEstimatedTime(delivery),
    };
  }

  private validateStatusTransition(
    currentStatus: DeliveryStatus,
    newStatus: DeliveryStatus,
  ): void {
    const validTransitions: Record<DeliveryStatus, DeliveryStatus[]> = {
      PENDING: ['ACCEPTED'],
      ACCEPTED: ['PICKED_UP'],
      PICKED_UP: ['DELIVERED'],
      DELIVERED: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    // TODO implement driving distance instead of straight-line distance
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
  }

  private calculateEstimatedTime(delivery: DeliveryWithRelations): number {
    if (delivery.status === 'DELIVERED' || delivery.status === 'PENDING')
      return undefined;

    let distanceToRestaurant = 0;
    let distanceToCustomer = 0;

    if (delivery.status === 'ACCEPTED') {
      // delivery to restaurant + restaurant to customer
      distanceToRestaurant = this.calculateDistance(
        delivery.currentLatitude,
        delivery.currentLongitude,
        delivery.order.restaurant.address.latitude,
        delivery.order.restaurant.address.longitude,
      );

      distanceToCustomer = this.calculateDistance(
        delivery.order.restaurant.address.latitude,
        delivery.order.restaurant.address.longitude,
        delivery.order.deliveryAddress.latitude,
        delivery.order.deliveryAddress.longitude,
      );
    } else {
      // (status == 'PICKED_UP'): delivery to customer directly
      distanceToCustomer = this.calculateDistance(
        delivery.currentLatitude,
        delivery.currentLongitude,
        delivery.order.deliveryAddress.latitude,
        delivery.order.deliveryAddress.longitude,
      );
    }

    const averageSpeeds = {
      BICYCLE: 15,
      CAR: 25,
      MOTORCYCLE: 30,
    };

    const totalDistance = distanceToRestaurant + distanceToCustomer;
    const travelTime =
      (totalDistance / averageSpeeds[delivery.deliveryPerson.vehicleType]) * 60;
    const preparationTime = 10;

    return Math.round(travelTime + preparationTime);
  }
}
