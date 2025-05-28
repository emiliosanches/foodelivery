import { Module } from '@nestjs/common';
import { DeliveryPersonController } from './delivery-person.controller';
import { DeliveryPersonServicePort } from '@/application/ports/in/services/delivery-person.service.port';
import { DeliveryPersonService } from '@/application/services/delivery-person.service';
import { PrismaModule } from '@/infra/adapters/out/persistence/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DeliveryPersonController],
  providers: [
    {
      provide: DeliveryPersonServicePort,
      useClass: DeliveryPersonService,
    },
  ],
  exports: [DeliveryPersonServicePort],
})
export class DeliveryPersonModule {}
