import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { PaymentMethodRepositoryPort } from '@/application/ports/out/repositories/payment-method.repository.port';
import { PaymentMethod } from '@/domain/entities/payment-method.entity';

@Injectable()
export class PaymentMethodRepositoryAdapter
  implements PaymentMethodRepositoryPort
{
  constructor(private prisma: PrismaService) {}

  async create(paymentMethod: PaymentMethod): Promise<PaymentMethod> {
    return this.prisma.paymentMethod.create({
      data: {
        id: paymentMethod.id,
        userId: paymentMethod.userId,
        type: paymentMethod.type,
        providerPaymentMethodId: paymentMethod.providerPaymentMethodId,
        cardHolderName: paymentMethod.cardHolderName,
        lastFourDigits: paymentMethod.lastFourDigits,
        expiryMonth: paymentMethod.expiryMonth,
        expiryYear: paymentMethod.expiryYear,
        cardBrand: paymentMethod.cardBrand,
        isDefault: paymentMethod.isDefault,
        createdAt: paymentMethod.createdAt,
        updatedAt: paymentMethod.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<PaymentMethod | null> {
    return this.prisma.paymentMethod.findUnique({
      where: { id },
    });
  }

  async findByUserId(userId: string): Promise<PaymentMethod[]> {
    return this.prisma.paymentMethod.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findDefaultByUserId(userId: string): Promise<PaymentMethod | null> {
    return this.prisma.paymentMethod.findFirst({
      where: {
        userId,
        isDefault: true,
      },
    });
  }

  async update(
    id: string,
    data: Partial<PaymentMethod>,
  ): Promise<PaymentMethod> {
    return this.prisma.paymentMethod.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

  }

  async delete(id: string): Promise<void> {
    await this.prisma.paymentMethod.delete({
      where: { id },
    });
  }

  async setDefaultPaymentMethod(
    userId: string,
    paymentMethodId: string,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.paymentMethod.updateMany({
        where: {
          userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
          updatedAt: new Date(),
        },
      });

      await tx.paymentMethod.update({
        where: { id: paymentMethodId },
        data: {
          isDefault: true,
          updatedAt: new Date(),
        },
      });
    });
  }
}
