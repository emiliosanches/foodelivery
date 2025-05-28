import { Module } from '@nestjs/common';
import { PaymentMethodController } from './payment-method.controller';
import { PaymentMethodServicePort } from '@/application/ports/in/services/payment-method.service.port';
import { PaymentMethodService } from '@/application/services/payment-method.service';
import { PaymentProviderPort } from '@/application/ports/out/payment/payment-provider.port';
import { StripePaymentProviderAdapter } from '@/infra/adapters/out/payment/stripe-payment-provider.adapter';
import { PixProviderPort } from '@/application/ports/out/payment/pix-provider.port';
import { MockPixProviderAdapter } from '@/infra/adapters/out/payment/mock-pix-provider.adapter';
import { PrismaModule } from '@/infra/adapters/out/persistence/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PaymentMethodController],
  providers: [
    {
      provide: PaymentMethodServicePort,
      useClass: PaymentMethodService,
    },
    {
      provide: PaymentProviderPort,
      useClass: StripePaymentProviderAdapter,
    },
    {
      provide: PixProviderPort,
      useClass: MockPixProviderAdapter,
    },
  ],
  exports: [PaymentMethodServicePort, PaymentProviderPort, PixProviderPort],
})
export class PaymentMethodModule {}
