import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UserRepositoryAdapter } from '../user.repository.adapter';
import { UserRepositoryPort } from '@/application/ports/out/repositories/user.repository.port';

@Module({
  providers: [
    PrismaService,
    { provide: UserRepositoryPort, useClass: UserRepositoryAdapter },
  ],
  exports: [PrismaService, UserRepositoryPort],
})
export class PrismaModule {}
