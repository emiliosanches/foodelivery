import { CashPaymentData, PixPaymentData } from '../value-objects';

export type OrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type OrderPaymentType = 'STORED_CARD' | 'PIX' | 'CASH';

export class Order {
  id: string;
  customerId: string;
  restaurantId: string;
  deliveryAddressId: string;
  paymentType: OrderPaymentType;
  paymentMethodId?: string;
  paymentData?: PixPaymentData | CashPaymentData;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  notes?: string;
  cancellationReason?: string;
  estimatedDeliveryTime?: Date;
  acceptedAt?: Date;
  readyAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
