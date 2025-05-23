import { Module } from '@nestjs/common';
import { AppConfigModule } from './infra/config/config.module';
import { PrismaModule } from './infra/adapters/out/persistence/prisma/prisma.module';
import { AuthModule } from './infra/adapters/in/rest/modules/auth/auth.module';
import { UsersModule } from './infra/adapters/in/rest/modules/users/users.module';
import { RestaurantModule } from './infra/adapters/in/rest/modules/restaurants/restaurant.module';
import { AddressModule } from './infra/adapters/in/rest/modules/address/address.module';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    RestaurantModule,
    AddressModule,
  ],
})
export class AppModule {}
