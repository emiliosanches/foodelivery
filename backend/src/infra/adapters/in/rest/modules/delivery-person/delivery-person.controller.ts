import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/infra/adapters/in/rest/common/guards/jwt-auth.guard';
import { DeliveryPersonGuard } from '@/infra/adapters/in/rest/common/guards/delivery-person.guard';
import { DeliveryPersonServicePort } from '@/application/ports/in/services/delivery-person.service.port';
import { CreateDeliveryPersonDto } from '@/application/dtos/delivery-person/create-delivery-person.dto';
import {
  UpdateDeliveryPersonDto,
  UpdateLocationDto,
  UpdateAvailabilityDto,
} from '@/application/dtos/delivery-person/update-delivery-person.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentDeliveryPerson } from '../../common/decorators/current-delivery-person.decorator';
import { User } from '@/domain/entities/user.entity';
import { DeliveryPerson } from '@/domain/delivery-person/entities/delivery-person.entity';

@Controller('users/me/delivery-profile')
@UseGuards(JwtAuthGuard)
export class DeliveryPersonController {
  constructor(
    private readonly deliveryPersonService: DeliveryPersonServicePort,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createProfile(
    @CurrentUser() user: User,
    @Body() createDeliveryPersonDto: CreateDeliveryPersonDto,
  ) {
    return this.deliveryPersonService.create(user.id, createDeliveryPersonDto);
  }

  @Get()
  @UseGuards(DeliveryPersonGuard)
  async getProfile(@CurrentDeliveryPerson() deliveryPerson: DeliveryPerson) {
    return deliveryPerson;
  }

  @Put()
  @UseGuards(DeliveryPersonGuard)
  async updateProfile(
    @CurrentDeliveryPerson() deliveryPerson: DeliveryPerson,
    @Body() updateDeliveryPersonDto: UpdateDeliveryPersonDto,
  ) {
    return this.deliveryPersonService.update(
      deliveryPerson.id,
      updateDeliveryPersonDto,
    );
  }

  @Put('location')
  @UseGuards(DeliveryPersonGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLocation(
    @CurrentDeliveryPerson() deliveryPerson: DeliveryPerson,
    @Body() updateLocationDto: UpdateLocationDto,
  ) {
    await this.deliveryPersonService.updateLocation(
      deliveryPerson.id,
      updateLocationDto.latitude,
      updateLocationDto.longitude,
    );
  }

  @Put('availability')
  @UseGuards(DeliveryPersonGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateAvailability(
    @CurrentDeliveryPerson() deliveryPerson: DeliveryPerson,
    @Body() updateAvailabilityDto: UpdateAvailabilityDto,
  ) {
    if (updateAvailabilityDto.availability === 'OFFLINE')
      await this.deliveryPersonService.goOffline(deliveryPerson.id);
    else await this.deliveryPersonService.goOnline(deliveryPerson.id);
  }
}
