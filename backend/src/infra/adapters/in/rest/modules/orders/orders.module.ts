import { Module } from '@nestjs/common';
import { PrismaModule } from '@/infra/adapters/out/persistence/prisma/prisma.module';
import { OrderController } from './orders.controller';
import { OrderService } from '@/application/services/order.service';
import { OrderServicePort } from '@/application/ports/in/services/order.service.port';
import { PaymentMethodModule } from '../payment-methods/payment-method.module';
import { RestaurantModule } from '../restaurants/restaurant.module';

@Module({
  imports: [PrismaModule, PaymentMethodModule, RestaurantModule],
  controllers: [OrderController],
  providers: [
    {
      provide: OrderServicePort,
      useClass: OrderService,
    },
  ],
  exports: [OrderServicePort],
})
export class OrderModule {}
