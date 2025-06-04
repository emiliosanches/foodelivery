import { Injectable } from '@nestjs/common';
import { Notification } from '../../domain/notification';
import { NotificationRepositoryPort } from '../ports/out/repositories/notification.repository.port';
import { GetNotificationsDto } from '../dtos/notification/get-notifications.dto';
import { PaginationOutputDto } from '@/shared/utils/pagination.utils';
import { v7 } from 'uuid';
import { CreateNotificationDto } from '../dtos/notification';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepositoryPort,
  ) {}

  async createNotification(createNotificationDto: CreateNotificationDto) {
    const result = await this.notificationRepository.create({
      id: v7(),
      userId: createNotificationDto.userId,
      orderId: createNotificationDto.orderId,
      type: createNotificationDto.type,
      title: createNotificationDto.title,
      message: createNotificationDto.message,
      metadata: createNotificationDto.metadata,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return result;
  }

  async getNotifications({
    userId,
    page = 1,
    pageSize = 50,
    unreadOnly = false,
  }: GetNotificationsDto & { userId: string }): Promise<
    PaginationOutputDto<Notification>
  > {
    const result = await this.notificationRepository.paginateByUserId({
      userId,
      page,
      pageSize,
      unreadOnly,
    });

    return result;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.markAllAsRead(userId);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.countUnread(userId);
  }
}
