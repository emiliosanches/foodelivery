import { GetNotificationsDto } from '@/application/dtos/notification/get-notifications.dto';
import { NotificationService } from '@/application/services/notification.service';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators';
import { User } from '@/domain/entities/user.entity';

@Controller('users/me/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationService) {}

  @Get()
  async getUserNotifications(
    @CurrentUser() user: User,
    @Query() { page, pageSize, unreadOnly }: GetNotificationsDto,
  ) {
    return this.notificationsService.getNotifications({
      userId: user.id,
      page,
      pageSize,
      unreadOnly,
    });
  }

  @Get('count')
  async getUserUnreadNotificationsCount(@CurrentUser() user: User) {
    return this.notificationsService.getUnreadCount(user.id);
  }
}

