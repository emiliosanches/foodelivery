import { Module } from '@nestjs/common';

import { RestaurantController } from './restaurant.controller';
import { CategoryController } from './category.controller';
import { MenuItemController } from './menu-item.controller';
import { RestaurantServicePort } from '@/application/ports/in/services/restaurant.service.port';
import { CategoryServicePort } from '@/application/ports/in/services/category.service.port';
import { MenuItemServicePort } from '@/application/ports/in/services/menu-item.service.port';
import { RestaurantService } from '@/application/services/restaurant.service';
import { CategoryService } from '@/application/services/category.service';
import { MenuItemService } from '@/application/services/menu-items.service';
import { PrismaModule } from '@/infra/adapters/out/persistence/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RestaurantController, CategoryController, MenuItemController],
  providers: [
    {
      provide: RestaurantServicePort,
      useClass: RestaurantService,
    },
    {
      provide: CategoryServicePort,
      useClass: CategoryService,
    },
    {
      provide: MenuItemServicePort,
      useClass: MenuItemService,
    },
  ],
  exports: [RestaurantServicePort, CategoryServicePort, MenuItemServicePort],
})
export class RestaurantModule {}
