import { OrderStatus } from '../entities/order.entity';

export class OrderBusinessRules {
  private static readonly RESTAURANT_ALLOWED_STATUSES: OrderStatus[] = [
    'PREPARING',
    'READY',
    'CANCELLED',
  ];

  private static readonly DELIVERY_ALLOWED_STATUSES: OrderStatus[] = [
    'OUT_FOR_DELIVERY',
    'DELIVERED',
  ];

  static calculateEstimatedDeliveryTime(
    deliveryTimeMax: number,
    acceptedAt: Date,
  ): Date {
    return new Date(
      acceptedAt.setMinutes(acceptedAt.getMinutes() + deliveryTimeMax),
    );
  }

  static canRestaurantUpdateStatus(newStatus: OrderStatus): boolean {
    return this.RESTAURANT_ALLOWED_STATUSES.includes(newStatus);
  }

  static canDeliveryPersonUpdateStatus(newStatus: OrderStatus): boolean {
    return this.DELIVERY_ALLOWED_STATUSES.includes(newStatus);
  }

  static getRestaurantAllowedStatuses(): OrderStatus[] {
    return [...this.RESTAURANT_ALLOWED_STATUSES];
  }

  static getDeliveryAllowedStatuses(): OrderStatus[] {
    return [...this.DELIVERY_ALLOWED_STATUSES];
  }

  private static getNextValidStatuses(
    currentStatus: OrderStatus,
  ): OrderStatus[] {
    const statusFlow: Record<OrderStatus, OrderStatus[]> = {
      PENDING: ['PREPARING', 'CANCELLED'],
      PREPARING: ['READY', 'CANCELLED'],
      READY: ['OUT_FOR_DELIVERY'],
      OUT_FOR_DELIVERY: ['DELIVERED'],
      DELIVERED: [],
      CANCELLED: [],
    };

    return statusFlow[currentStatus] || [];
  }

  static isValidStatusTransition(
    currentStatus: OrderStatus,
    nextStatus: OrderStatus,
  ) {
    return this.getNextValidStatuses(currentStatus).includes(nextStatus);
  }
}
