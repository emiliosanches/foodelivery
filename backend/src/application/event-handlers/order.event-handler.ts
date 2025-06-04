import { OnEvent } from '@nestjs/event-emitter';
import {
  OrderCreatedEvent,
  OrderStatusUpdatedEvent,
} from '../../domain/events';
import { Injectable } from '@nestjs/common';
import { NotificationService } from '@/application/services/notification.service';
import { OrderStatus } from '@/domain/orders';
import { NotificationType } from '@/domain/notification';

@Injectable()
export class OrderEventHandler {
  constructor(private readonly notificationService: NotificationService) {}

  @OnEvent(OrderCreatedEvent.event)
  async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    await this.notificationService.createNotification({
      type: 'ORDER_CREATED',
      userId: event.customer.id,
      orderId: event.order.id,
    });
  }

  @OnEvent(OrderStatusUpdatedEvent.event)
  async handleOrderStatusUpdated(
    event: OrderStatusUpdatedEvent,
  ): Promise<void> {
    const type = this.getNotificationTypeByStatus(event.newStatus);

    if (!type) return;

    await this.notificationService.createNotification({
      type,
      userId: event.order.customerId,
      orderId: event.order.id,
    });
  }

  private getNotificationTypeByStatus(
    status: OrderStatus,
  ): NotificationType | undefined {
    const statusToTypeMapping: { [status in OrderStatus]?: NotificationType } =
      {
        PREPARING: 'ORDER_ACCEPTED',
        READY: 'ORDER_READY',
        OUT_FOR_DELIVERY: 'ORDER_OUT_FOR_DELIVERY',
        DELIVERED: 'ORDER_DELIVERED',
        CANCELLED: 'ORDER_CANCELLED',
      };

    return statusToTypeMapping[status];
  }
}

