import { Notification } from '@/domain/notification';
import { PaginationOutputDto } from '@/shared/utils/pagination.utils';

export abstract class NotificationRepositoryPort {
  abstract paginateByUserId(options: {
    userId: string;
    page: number;
    pageSize: number;
    unreadOnly: boolean;
  }): Promise<PaginationOutputDto<Notification>>;
  abstract create(notification: Notification): Promise<Notification>;
  abstract markAllAsRead(userId: string): Promise<void>;
  abstract countUnread(userId: string): Promise<number>;
}

