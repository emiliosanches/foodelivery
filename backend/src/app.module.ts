import { Module } from '@nestjs/common';
import { AppConfigModule } from './infra/config/config.module';
import { PrismaModule } from './infra/adapters/out/persistence/prisma/prisma.module';
import { AuthModule } from './infra/adapters/in/rest/modules/auth/auth.module';

@Module({
  imports: [AppConfigModule, PrismaModule, AuthModule],
})
export class AppModule {}
