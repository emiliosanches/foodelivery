import { CreatePaymentMethodDto } from '@/application/dtos/payment-method/create-payment-method.dto';
import { UpdatePaymentMethodDto } from '@/application/dtos/payment-method/update-payment-method.dto';
import { PaymentMethod } from '@/domain/entities/payment-method.entity';

export abstract class PaymentMethodServicePort {
  abstract create(
    userId: string,
    data: CreatePaymentMethodDto,
  ): Promise<PaymentMethod>;
  abstract findAllByUser(userId: string): Promise<PaymentMethod[]>;
  abstract findById(
    userId: string,
    paymentMethodId: string,
  ): Promise<PaymentMethod>;
  abstract update(
    userId: string,
    paymentMethodId: string,
    data: UpdatePaymentMethodDto,
  ): Promise<PaymentMethod>;
  abstract delete(userId: string, paymentMethodId: string): Promise<void>;
  abstract setAsDefault(
    userId: string,
    paymentMethodId: string,
  ): Promise<PaymentMethod>;
}
