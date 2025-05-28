import { Injectable } from '@nestjs/common';
import {
  PixProviderPort,
  PixQrCodeRequest,
  PixQrCodeResponse,
  PixPaymentStatus,
} from '@/application/ports/out/payment/pix-provider.port';

@Injectable()
export class MockPixProviderAdapter extends PixProviderPort {
  async generateQrCode(request: PixQrCodeRequest): Promise<PixQrCodeResponse> {
    const pixCode = `PIX${request.orderId}${request.amount}${Date.now()}`;
    const expiresAt = new Date();
    expiresAt.setMinutes(
      expiresAt.getMinutes() + (request.expirationMinutes || 30),
    );

    return {
      qrCode: pixCode,
      qrCodeBase64: this.generateMockQrCodeImage(pixCode),
      pixKey: 'minha-chave-pix@empresa.com',
      expiresAt,
    };
  }

  async checkPaymentStatus(orderId: string): Promise<PixPaymentStatus> {
    return {
      orderId,
      status: 'pending',
      amount: 0,
    };
  }

  private generateMockQrCodeImage(code: string): string {
    console.log(code);
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  }
}
