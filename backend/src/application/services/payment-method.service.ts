import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PaymentMethodServicePort } from '@/application/ports/in/services/payment-method.service.port';
import { PaymentMethodRepositoryPort } from '@/application/ports/out/repositories/payment-method.repository.port';
import { PaymentProviderPort } from '@/application/ports/out/payment/payment-provider.port';
import { CreatePaymentMethodDto } from '@/application/dtos/payment-method/create-payment-method.dto';
import { UpdatePaymentMethodDto } from '@/application/dtos/payment-method/update-payment-method.dto';
import { PaymentMethod } from '@/domain/entities/payment-method.entity';
import { v7 } from 'uuid';

@Injectable()
export class PaymentMethodService extends PaymentMethodServicePort {
  constructor(
    private readonly paymentMethodRepository: PaymentMethodRepositoryPort,
    private readonly paymentProvider: PaymentProviderPort,
  ) {
    super();
  }

  async create(
    userId: string,
    data: CreatePaymentMethodDto,
  ): Promise<PaymentMethod> {
    this.validateCardExpiry(data.expiryMonth, data.expiryYear);

    const providerResponse = await this.paymentProvider.createPaymentMethod({
      cardNumber: data.cardNumber,
      cardHolderName: data.cardHolderName,
      expiryMonth: data.expiryMonth,
      expiryYear: data.expiryYear,
      cvc: data.cvc,
    });

    const existingMethods =
      await this.paymentMethodRepository.findByUserId(userId);
    const isFirstMethod = existingMethods.length === 0;

    return await this.paymentMethodRepository.create({
      id: v7(),
      userId,
      type: data.type,
      providerPaymentMethodId: providerResponse.providerId,
      providerCustomerId: undefined,
      lastFourDigits: providerResponse.lastFourDigits,
      cardBrand: providerResponse.brand,
      cardHolderName: data.cardHolderName.toUpperCase(),
      expiryMonth: providerResponse.expiryMonth,
      expiryYear: providerResponse.expiryYear,
      isDefault: isFirstMethod,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async findAllByUser(userId: string): Promise<PaymentMethod[]> {
    const methods = await this.paymentMethodRepository.findByUserId(userId);

    return methods.sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  async findById(
    userId: string,
    paymentMethodId: string,
  ): Promise<PaymentMethod> {
    const paymentMethod =
      await this.paymentMethodRepository.findById(paymentMethodId);

    if (!paymentMethod || paymentMethod.userId !== userId) {
      throw new NotFoundException('Método de pagamento não encontrado');
    }

    return paymentMethod;
  }

  async update(
    userId: string,
    paymentMethodId: string,
    data: UpdatePaymentMethodDto,
  ): Promise<PaymentMethod> {
    await this.findById(userId, paymentMethodId);

    const updatedData = {
      cardHolderName: data.cardHolderName?.toUpperCase(),
    };

    return await this.paymentMethodRepository.update(
      paymentMethodId,
      updatedData,
    );
  }

  async delete(userId: string, paymentMethodId: string): Promise<void> {
    const existingMethod = await this.findById(userId, paymentMethodId);

    await this.paymentProvider.deletePaymentMethod(
      existingMethod.providerPaymentMethodId,
    );

    if (existingMethod.isDefault) {
      const otherMethods =
        await this.paymentMethodRepository.findByUserId(userId);
      const activeOthers = otherMethods.filter(
        (method) => method.id !== paymentMethodId,
      );

      if (activeOthers.length > 0) {
        const newDefault = activeOthers.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
        )[0];
        await this.paymentMethodRepository.update(newDefault.id, {
          isDefault: true,
        });
      }
    }

    await this.paymentMethodRepository.delete(paymentMethodId);
  }

  async setAsDefault(
    userId: string,
    paymentMethodId: string,
  ): Promise<PaymentMethod> {
    await this.findById(userId, paymentMethodId);

    await this.paymentMethodRepository.setDefaultPaymentMethod(
      userId,
      paymentMethodId,
    );

    return await this.paymentMethodRepository.findById(paymentMethodId)!;
  }

  private validateCardExpiry(month: string, year: string): void {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const expiryYear = parseInt(year);
    const expiryMonth = parseInt(month);

    if (
      expiryYear < currentYear ||
      (expiryYear === currentYear && expiryMonth < currentMonth)
    ) {
      throw new BadRequestException('Card expired');
    }
  }
}
