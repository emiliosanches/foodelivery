export interface CreatePaymentMethodRequest {
  cardNumber: string;
  cardHolderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
}

export interface PaymentMethodResponse {
  providerId: string; // Token/ID do provedor
  lastFourDigits: string; // Últimos 4 dígitos
  brand: string; // VISA, MASTERCARD, etc.
  expiryMonth: string;
  expiryYear: string;
}

export interface ProcessPaymentRequest {
  paymentMethodId: string; // ID do método no provedor
  amount: number; // Valor em centavos
  currency: string; // BRL, USD, etc.
  orderId: string; // ID do pedido
  customerId?: string; // ID do cliente no provedor
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  status: 'pending' | 'succeeded' | 'failed';
  errorMessage?: string;
}

export abstract class PaymentProviderPort {
  abstract createPaymentMethod(
    request: CreatePaymentMethodRequest,
  ): Promise<PaymentMethodResponse>;
  abstract getPaymentMethod(providerId: string): Promise<PaymentMethodResponse>;
  abstract deletePaymentMethod(providerId: string): Promise<void>;

  abstract processPayment(
    request: ProcessPaymentRequest,
  ): Promise<PaymentResult>;
  abstract refundPayment(
    transactionId: string,
    amount?: number,
  ): Promise<PaymentResult>;

  abstract createCustomer?(email: string, name: string): Promise<string>;
  abstract attachPaymentMethodToCustomer?(
    paymentMethodId: string,
    customerId: string,
  ): Promise<void>;
}
