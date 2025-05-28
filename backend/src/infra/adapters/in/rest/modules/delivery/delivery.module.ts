import { DeliveryServicePort } from '@/application/ports/in/services/delivery.service.port';
import { DeliveryService } from '@/application/services/delivery.service';
import { PrismaModule } from '@/infra/adapters/out/persistence/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { DeliveryPersonDeliveriesController } from './delivery-person-deliveries.controller';
import { DeliveryPersonModule } from '../delivery-person/delivery-person.module';

@Module({
  imports: [PrismaModule, DeliveryPersonModule],
  controllers: [DeliveryPersonDeliveriesController],
  providers: [{ provide: DeliveryServicePort, useClass: DeliveryService }],
  exports: [DeliveryServicePort],
})
export class DeliveryModule {}
