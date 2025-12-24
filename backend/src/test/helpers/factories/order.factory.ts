import {
  Order,
  OrderItem,
  OrderStatus,
  OrderPaymentType,
} from '@/domain/orders';
import { v7 as uuidv7 } from 'uuid';

export const createTestOrder = (overrides?: Partial<Order>): Order => {
  const defaultOrder: Order = {
    id: uuidv7(),
    customerId: uuidv7(),
    restaurantId: uuidv7(),
    deliveryAddressId: uuidv7(),
    paymentType: 'PIX' as OrderPaymentType,
    status: 'PENDING' as OrderStatus,
    subtotal: 50.0,
    deliveryFee: 5.0,
    totalAmount: 55.0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    ...defaultOrder,
    ...overrides,
  };
};

export const createTestOrderItem = (
  overrides?: Partial<OrderItem>,
): OrderItem => {
  const defaultOrderItem: OrderItem = {
    id: uuidv7(),
    orderId: uuidv7(),
    menuItemId: uuidv7(),
    productName: 'Test Product',
    productDescription: 'Test Description',
    quantity: 2,
    unitPrice: 25.0,
    totalPrice: 50.0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    ...defaultOrderItem,
    ...overrides,
  };
};

