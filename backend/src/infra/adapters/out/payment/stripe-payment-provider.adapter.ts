import { Injectable } from '@nestjs/common';
import {
  PaymentProviderPort,
  CreatePaymentMethodRequest,
  PaymentMethodResponse,
  ProcessPaymentRequest,
  PaymentResult,
} from '@/application/ports/out/payment/payment-provider.port';

@Injectable()
export class StripePaymentProviderAdapter extends PaymentProviderPort {
  private stripe: any; // Stripe SDK typing

  constructor() {
    super();
    // TODO Instantiate Stripe  SDK
  }

  async createPaymentMethod(
    request: CreatePaymentMethodRequest,
  ): Promise<PaymentMethodResponse> {
    try {
      // example:
      // const paymentMethod = await this.stripe.paymentMethods.create({
      //   type: 'card',
      //   card: {
      //     number: request.cardNumber,
      //     exp_month: parseInt(request.expiryMonth),
      //     exp_year: parseInt(request.expiryYear),
      //     cvc: request.cvc,
      //   },
      // });

      return {
        providerId: `pm_mock_${Date.now()}`, // paymentMethod.id
        lastFourDigits: request.cardNumber.slice(-4),
        brand: this.detectCardBrand(request.cardNumber),
        expiryMonth: request.expiryMonth,
        expiryYear: request.expiryYear,
      };
    } catch (error) {
      throw new Error(
        `Stripe payment method creation failed: ${error.message}`,
      );
    }
  }

  async getPaymentMethod(providerId: string): Promise<PaymentMethodResponse> {
    try {
      // example:
      // const paymentMethod = await this.stripe.paymentMethods.retrieve(providerId);

      return {
        providerId: providerId,
        lastFourDigits: '1234',
        brand: 'VISA',
        expiryMonth: '12',
        expiryYear: '2025',
      };
    } catch (error) {
      throw new Error(`Failed to retrieve payment method: ${error.message}`);
    }
  }

  async deletePaymentMethod(providerId: string): Promise<void> {
    try {
      // example:
      // await this.stripe.paymentMethods.detach(providerId);
      console.log(`Mock: Deleted payment method ${providerId} from Stripe`);
    } catch (error) {
      throw new Error(`Failed to delete payment method: ${error.message}`);
    }
  }

  async processPayment(request: ProcessPaymentRequest): Promise<PaymentResult> {
    try {
      // example
      // const paymentIntent = await this.stripe.paymentIntents.create({
      //   amount: request.amount,
      //   currency: request.currency,
      //   payment_method: request.paymentMethodId,
      //   confirm: true,
      //   metadata: {
      //     orderId: request.orderId,
      //   },
      // });

      return {
        success: true,
        transactionId: `pi_mock_${Date.now()}`, // paymentIntent.id
        status: 'succeeded', // paymentIntent.status
      };
    } catch (error) {
      return {
        success: false,
        transactionId: '',
        status: 'failed',
        errorMessage: error.message,
      };
    }
  }

  async refundPayment(
    transactionId: string,
    amount?: number,
  ): Promise<PaymentResult> {
    try {
      // example
      // const refund = await this.stripe.refunds.create({
      //   payment_intent: transactionId,
      //   amount: amount,
      // });

      return {
        success: true,
        transactionId: `re_mock_${Date.now()}`, // refund.id
        status: 'succeeded',
      };
    } catch (error) {
      return {
        success: false,
        transactionId: '',
        status: 'failed',
        errorMessage: error.message,
      };
    }
  }

  async createCustomer(email: string, name: string): Promise<string> {
    try {
      // example
      // const customer = await this.stripe.customers.create({
      //   email: email,
      //   name: name,
      // });

      return `cus_mock_${Date.now()}`; // customer.id
    } catch (error) {
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  }

  async attachPaymentMethodToCustomer(
    paymentMethodId: string,
    customerId: string,
  ): Promise<void> {
    try {
      // example
      // await this.stripe.paymentMethods.attach(paymentMethodId, {
      //   customer: customerId,
      // });

      console.log(
        `Mock: Attached payment method ${paymentMethodId} to customer ${customerId}`,
      );
    } catch (error) {
      throw new Error(
        `Failed to attach payment method to customer: ${error.message}`,
      );
    }
  }

  private detectCardBrand(cardNumber: string): string {
    const number = cardNumber.replace(/\D/g, '');

    if (number.startsWith('4')) return 'VISA';
    if (number.startsWith('5') || number.startsWith('2')) return 'MASTERCARD';
    if (number.startsWith('3')) return 'AMERICAN_EXPRESS';
    if (number.startsWith('6')) return 'ELO';

    return 'OTHER';
  }
}
