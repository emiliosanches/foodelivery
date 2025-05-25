export interface PixPaymentData {
  pixCode: string;
  qrCodeImage?: string;
  expiresAt: Date;
  txId?: string;
}

export interface CashPaymentData {
  changeFor?: number;
}

export class PaymentDataValidator {
  static isValidPixData(data: PixPaymentData): boolean {
    return !!(
      data.pixCode &&
      data.pixCode.length > 0 &&
      data.expiresAt &&
      data.expiresAt > new Date()
    );
  }

  static isValidCashData(data: CashPaymentData): boolean {
    return data.changeFor === undefined || data.changeFor >= 0;
  }

  static parsePixData(jsonString: string): PixPaymentData | null {
    try {
      const data = JSON.parse(jsonString) as PixPaymentData;
      return this.isValidPixData(data) ? data : null;
    } catch {
      return null;
    }
  }

  static parseCashData(jsonString: string): CashPaymentData | null {
    try {
      const data = JSON.parse(jsonString) as CashPaymentData;
      return this.isValidCashData(data) ? data : null;
    } catch {
      return null;
    }
  }
}
