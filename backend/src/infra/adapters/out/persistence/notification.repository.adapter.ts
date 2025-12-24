import {
  PaginationOutputDto,
  buildPagination,
} from '@/shared/utils/pagination.utils';
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { NotificationRepositoryPort } from '@/application/ports/out/repositories/notification.repository.port';
import { Notification } from '@/domain/notification';

@Injectable()
export class NotificationRepositoryAdapter extends NotificationRepositoryPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async paginateByUserId(options: {
    userId: string;
    page: number;
    pageSize: number;
    unreadOnly: boolean;
  }): Promise<PaginationOutputDto<Notification>> {
    const skip = (options.page - 1) * options.pageSize;

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId: options.userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: options.pageSize,
      }),
      this.prisma.notification.count({
        where: { userId: options.userId },
      }),
    ]);

    return buildPagination(
      notifications,
      total,
      options.page,
      options.pageSize,
    );
  }

  create(notification: Notification): Promise<Notification> {
    return this.prisma.notification.create({
      data: notification,
    });
  }

  async findById(id: string): Promise<Notification | null> {
    return this.prisma.notification.findUnique({
      where: { id },
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true, updatedAt: new Date() },
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId },
      data: { isRead: true },
    });
  }

  countUnread(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
      },
    });
  }
}
