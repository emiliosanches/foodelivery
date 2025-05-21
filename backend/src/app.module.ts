import { Module } from '@nestjs/common';
import { PrismaModule } from '@/infra/adapters/out/persistence/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
