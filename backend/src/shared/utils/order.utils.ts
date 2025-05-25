import { MenuItem } from '@/domain/entities/menu-item.entity';
import { Order, OrderItem } from '@/domain/orders';

export class OrderItemSnapshot {
  static createFromMenuItem(
    menuItem: MenuItem,
    quantity: number,
  ): Partial<OrderItem> {
    const unitPrice = menuItem.price;
    const totalPrice = unitPrice * quantity;

    return {
      menuItemId: menuItem.id,
      productName: menuItem.name,
      productDescription: menuItem.description || undefined,
      productImageUrl: menuItem.imageUrl || undefined,
      quantity,
      unitPrice,
      totalPrice,
    };
  }
}

export class OrderPaymentUtils {
  static usesSavedCard(order: Order): boolean {
    return order.paymentType === 'STORED_CARD' && !!order.paymentMethodId;
  }

  static usesPix(order: Order): boolean {
    return order.paymentType === 'PIX';
  }

  static usesCash(order: Order): boolean {
    return order.paymentType === 'CASH';
  }
}
