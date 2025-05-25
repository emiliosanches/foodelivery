export type StoredPaymentType = 'CREDIT_CARD' | 'DEBIT_CARD';

export class PaymentMethod {
  id: string;
  userId: string;
  type: StoredPaymentType;
  providerPaymentMethodId: string;
  providerCustomerId?: string;
  lastFourDigits: string;
  cardBrand: string;
  cardHolderName: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
