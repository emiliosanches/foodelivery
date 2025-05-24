export interface PixQrCodeRequest {
  amount: number;
  orderId: string;
  description?: string;
  expirationMinutes?: number;
}

export interface PixQrCodeResponse {
  qrCode: string;
  qrCodeBase64: string;
  pixKey: string;
  expiresAt: Date;
}

export interface PixPaymentStatus {
  orderId: string;
  status: 'pending' | 'paid' | 'expired';
  paidAt?: Date;
  amount: number;
}

export abstract class PixProviderPort {
  abstract generateQrCode(
    request: PixQrCodeRequest,
  ): Promise<PixQrCodeResponse>;
  abstract checkPaymentStatus(orderId: string): Promise<PixPaymentStatus>;
}
