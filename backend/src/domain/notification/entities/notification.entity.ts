export type NotificationType =
  | 'ORDER_CREATED'
  | 'ORDER_ACCEPTED'
  | 'ORDER_READY'
  | 'ORDER_OUT_FOR_DELIVERY'
  | 'ORDER_DELIVERED'
  | 'ORDER_CANCELLED'
  | 'DELIVERY_ASSIGNED';

export class Notification {
  id: string;
  userId: string;
  orderId?: string;
  type: NotificationType;
  title?: string;
  message?: string;
  isRead: boolean;
  metadata?: string;
  createdAt: Date;
  updatedAt: Date;
}
