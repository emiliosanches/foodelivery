import { PixProviderPort } from '@/application/ports/out/payment/pix-provider.port';

export const createMockPixProvider = (): jest.Mocked<PixProviderPort> => {
  return {
    generateQrCode: jest.fn(),
    checkPaymentStatus: jest.fn(),
  } as jest.Mocked<PixProviderPort>;
};

