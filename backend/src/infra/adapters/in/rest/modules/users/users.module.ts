import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from '@/application/services/users.service'; 
import { PrismaModule } from '@/infra/adapters/out/persistence/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
