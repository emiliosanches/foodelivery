import { OnEvent } from '@nestjs/event-emitter';
import {
  OrderCreatedEvent,
  OrderStatusUpdatedEvent,
} from '../../domain/events';
import { Injectable } from '@nestjs/common';
import { NotificationService } from '@/application/services/notification.service';
import { OrderStatus } from '@/domain/orders';
import { NotificationType } from '@/domain/notification';
import { WebSocketPort } from '@/application/ports/out/websocket';

@Injectable()
export class OrderEventHandler {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly webSocketPort: WebSocketPort,
  ) {}

  @OnEvent(OrderCreatedEvent.event)
  async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    // Create notification in database
    const notification = await this.notificationService.createNotification({
      type: 'ORDER_CREATED',
      userId: event.customer.id,
      orderId: event.order.id,
    });

    // Send real-time notification to customer
    this.webSocketPort.emitToUser(event.customer.id, {
      event: 'notification:new',
      data: notification,
    });

    // Send real-time notification to restaurant
    this.webSocketPort.emitToUser(event.restaurant.userId, {
      event: 'order:new',
      data: {
        orderId: event.order.id,
        customer: {
          id: event.customer.id,
          name: event.customer.name,
        },
        items: event.items,
        totalAmount: event.order.totalAmount,
      },
    });
  }

  @OnEvent(OrderStatusUpdatedEvent.event)
  async handleOrderStatusUpdated(
    event: OrderStatusUpdatedEvent,
  ): Promise<void> {
    const type = this.getNotificationTypeByStatus(event.newStatus);

    if (!type) return;

    // Create notification in database
    const notification = await this.notificationService.createNotification({
      type,
      userId: event.order.customerId,
      orderId: event.order.id,
    });

    // Send real-time notification to customer
    this.webSocketPort.emitToUser(event.order.customerId, {
      event: 'notification:new',
      data: notification,
    });

    // Send order status update
    this.webSocketPort.emitToUser(event.order.customerId, {
      event: 'order:status-updated',
      data: {
        orderId: event.order.id,
        status: event.newStatus,
      },
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
