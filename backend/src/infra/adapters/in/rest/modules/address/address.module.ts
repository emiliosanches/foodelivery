import { Module } from '@nestjs/common';
import { AddressController } from './address.controller';
import { AddressServicePort } from '@/application/ports/in/services/address.service.port';
import { AddressService } from '@/application/services/address.service';
import { PrismaModule } from '@/infra/adapters/out/persistence/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AddressController],
  providers: [
    {
      provide: AddressServicePort,
      useClass: AddressService,
    },
  ],
  exports: [AddressServicePort],
})
export class AddressModule {}
