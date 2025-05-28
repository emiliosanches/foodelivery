import { Module } from '@nestjs/common';
import { AppConfigModule } from './infra/config/config.module';
import { PrismaModule } from './infra/adapters/out/persistence/prisma/prisma.module';
import { AuthModule } from './infra/adapters/in/rest/modules/auth/auth.module';
import { UsersModule } from './infra/adapters/in/rest/modules/users/users.module';
import { RestaurantModule } from './infra/adapters/in/rest/modules/restaurants/restaurant.module';
import { AddressModule } from './infra/adapters/in/rest/modules/address/address.module';
import { PaymentMethodModule } from './infra/adapters/in/rest/modules/payment-methods/payment-method.module';
import { OrderModule } from './infra/adapters/in/rest/modules/orders/orders.module';
import { DeliveryPersonModule } from './infra/adapters/in/rest/modules/delivery-person/delivery-person.module';
import { DeliveryModule } from './infra/adapters/in/rest/modules/delivery/delivery.module';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    RestaurantModule,
    AddressModule,
    PaymentMethodModule,
    OrderModule,
    DeliveryModule,
    DeliveryPersonModule,
  ],
})
export class AppModule {}
