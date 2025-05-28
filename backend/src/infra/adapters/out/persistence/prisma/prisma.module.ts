import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

import { UserRepositoryAdapter } from '../user.repository.adapter';
import { UserRepositoryPort } from '@/application/ports/out/repositories/user.repository.port';

import { RestaurantRepositoryAdapter } from '../restaurant.repository.adapter';
import { CategoryRepositoryAdapter } from '../category.repository.adapter';
import { MenuItemRepositoryAdapter } from '../menu-item.repository.adapter';
import { AddressRepositoryAdapter } from '../address.repository.adapter';

import { RestaurantRepositoryPort } from '@/application/ports/out/repositories/restaurant.repository.port';
import { CategoryRepositoryPort } from '@/application/ports/out/repositories/category.repository.port';
import { MenuItemRepositoryPort } from '@/application/ports/out/repositories/menu-item.repository.port';
import { AddressRepositoryPort } from '@/application/ports/out/repositories/address.repository.port';
import { PaymentMethodRepositoryPort } from '@/application/ports/out/repositories/payment-method.repository.port';
import { PaymentMethodRepositoryAdapter } from '../payment-method.repository.adapter';
import { OrderRepositoryPort } from '@/application/ports/out/repositories/order.repository.port';
import { OrderRepositoryAdapter } from '../order.repository.adapter';
import { DeliveryPersonRepositoryPort } from '@/application/ports/out/repositories/delivery-person.repository.port';
import { DeliveryPersonRepositoryAdapter } from '../delivery-person.repository.adapter';
import { DeliveryRepositoryPort } from '@/application/ports/out/repositories/delivery.repository.port';
import { DeliveryRepositoryAdapter } from '../delivery.repository.adapter';

@Module({
  providers: [
    PrismaService,
    { provide: UserRepositoryPort, useClass: UserRepositoryAdapter },
    {
      provide: RestaurantRepositoryPort,
      useClass: RestaurantRepositoryAdapter,
    },
    { provide: CategoryRepositoryPort, useClass: CategoryRepositoryAdapter },
    { provide: MenuItemRepositoryPort, useClass: MenuItemRepositoryAdapter },
    { provide: AddressRepositoryPort, useClass: AddressRepositoryAdapter },
    {
      provide: PaymentMethodRepositoryPort,
      useClass: PaymentMethodRepositoryAdapter,
    },
    {
      provide: OrderRepositoryPort,
      useClass: OrderRepositoryAdapter,
    },
    {
      provide: DeliveryPersonRepositoryPort,
      useClass: DeliveryPersonRepositoryAdapter,
    },
    {
      provide: DeliveryRepositoryPort,
      useClass: DeliveryRepositoryAdapter,
    },
  ],
  exports: [
    PrismaService,
    UserRepositoryPort,
    RestaurantRepositoryPort,
    CategoryRepositoryPort,
    MenuItemRepositoryPort,
    AddressRepositoryPort,
    PaymentMethodRepositoryPort,
    OrderRepositoryPort,
    DeliveryPersonRepositoryPort,
    DeliveryRepositoryPort,
  ],
})
export class PrismaModule {}
