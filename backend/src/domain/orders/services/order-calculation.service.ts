import { OrderItem } from '../entities/order-item.entity';

export class OrderCalculationService {
  static calculateSubtotal(items: Partial<OrderItem>[]): number {
    return items.reduce((total, item) => total + (item.totalPrice || 0), 0);
  }

  static calculateTotal(subtotal: number, deliveryFee: number): number {
    return subtotal + deliveryFee;
  }

  static validateItemsPricing(items: Partial<OrderItem>[]): boolean {
    return items.every((item) => {
      if (!item.quantity || !item.unitPrice) return false;
      const expectedTotal = item.quantity * item.unitPrice;
      return item.totalPrice === expectedTotal;
    });
  }

  static isTotalCorrect(
    subtotal: number,
    deliveryFee: number,
    totalAmount: number,
  ): boolean {
    return totalAmount === subtotal + deliveryFee;
  }

  static meetsMinimumOrder(total: number, minimumOrder: number = 0): boolean {
    return total >= minimumOrder;
  }
}
