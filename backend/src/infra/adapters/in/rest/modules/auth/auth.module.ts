import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from '@/application/services/auth.service';
import { UserRepositoryAdapter } from '../../../../out/persistence/user.repository.adapter';
import { PrismaModule } from '../../../../out/persistence/prisma/prisma.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { jwtConfig } from '@/infra/config/jwt.config';
import { UserRepositoryPort } from '@/application/ports/out/repositories/user.repository.port';
import { AuthServicePort } from '@/application/ports/in/services/auth.service.port';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: jwtConfig,
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: AuthServicePort,
      useClass: AuthService,
    },
    {
      provide: UserRepositoryPort,
      useClass: UserRepositoryAdapter,
    },
    JwtStrategy,
  ],
})
export class AuthModule {}
