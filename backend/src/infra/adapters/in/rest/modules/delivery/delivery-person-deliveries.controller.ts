import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/infra/adapters/in/rest/common/guards/jwt-auth.guard';
import { DeliveryPersonGuard } from '@/infra/adapters/in/rest/common/guards/delivery-person.guard';
import { DeliveryServicePort } from '@/application/ports/in/services/delivery.service.port';
import { UpdateDeliveryLocationDto } from '@/application/dtos/delivery';
import { CurrentDeliveryPerson } from '../../common/decorators/current-delivery-person.decorator';
import { DeliveryPerson } from '@/domain/delivery-person/entities/delivery-person.entity';

@Controller('users/me/delivery-profile/deliveries')
@UseGuards(JwtAuthGuard, DeliveryPersonGuard)
export class DeliveryPersonDeliveriesController {
  constructor(private readonly deliveryService: DeliveryServicePort) {}

  @Get()
  async getMyDeliveries(
    @CurrentDeliveryPerson() deliveryPerson: DeliveryPerson,
  ) {
    return this.deliveryService.getDeliveriesByDeliveryPerson(
      deliveryPerson.id,
    );
  }

  @Get(':deliveryId')
  async getDeliveryById(
    @CurrentDeliveryPerson() deliveryPerson: DeliveryPerson,
    @Param('deliveryId') deliveryId: string,
  ) {
    return this.deliveryService.getDeliveryById(deliveryId, deliveryPerson.id);
  }

  @Post(':deliveryId/accept')
  @HttpCode(HttpStatus.NO_CONTENT)
  async acceptDelivery(
    @CurrentDeliveryPerson() deliveryPerson: DeliveryPerson,
    @Param('deliveryId') deliveryId: string,
  ) {
    await this.deliveryService.acceptDelivery(deliveryId, deliveryPerson.id);
  }

  // TODO remove this, sync with delivery person's location using events
  @Put(':deliveryId/location')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateDeliveryLocation(
    @CurrentDeliveryPerson() deliveryPerson: DeliveryPerson,
    @Param('deliveryId') deliveryId: string,
    @Body() updateLocationDto: UpdateDeliveryLocationDto,
  ) {
    await this.deliveryService.updateDeliveryLocation(
      deliveryId,
      deliveryPerson.id,
      updateLocationDto.latitude,
      updateLocationDto.longitude,
    );
  }

  @Post(':deliveryId/pickup')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAsPickedUp(
    @CurrentDeliveryPerson() deliveryPerson: DeliveryPerson,
    @Param('deliveryId') deliveryId: string,
  ) {
    await this.deliveryService.updateDeliveryStatus(
      deliveryId,
      deliveryPerson.id,
      'PICKED_UP',
    );
  }

  @Post(':deliveryId/deliver')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAsDelivered(
    @CurrentDeliveryPerson() deliveryPerson: DeliveryPerson,
    @Param('deliveryId') deliveryId: string,
  ) {
    await this.deliveryService.updateDeliveryStatus(
      deliveryId,
      deliveryPerson.id,
      'DELIVERED',
    );
  }
}
