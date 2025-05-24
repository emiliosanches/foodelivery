import { PaymentMethod } from '@/domain/entities/payment-method.entity';

export abstract class PaymentMethodRepositoryPort {
  abstract create(paymentMethod: PaymentMethod): Promise<PaymentMethod>;
  abstract findById(id: string): Promise<PaymentMethod | null>;
  abstract findByUserId(userId: string): Promise<PaymentMethod[]>;
  abstract findDefaultByUserId(userId: string): Promise<PaymentMethod | null>;
  abstract update(
    id: string,
    data: Partial<PaymentMethod>,
  ): Promise<PaymentMethod>;
  abstract delete(id: string): Promise<void>;
  abstract setDefaultPaymentMethod(
    userId: string,
    paymentMethodId: string,
  ): Promise<void>;
}
