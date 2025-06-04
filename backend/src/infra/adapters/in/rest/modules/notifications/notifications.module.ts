import { Module } from '@nestjs/common';
import { PrismaModule } from '@/infra/adapters/out/persistence/prisma/prisma.module';
import { NotificationsController } from './notifications.controller';
import { NotificationService } from '@/application/services/notification.service';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationsController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationsModule {}

