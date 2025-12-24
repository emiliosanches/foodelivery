import { OrderCalculationService } from './order-calculation.service';
import { OrderItem } from '../entities/order-item.entity';

describe('OrderCalculationService', () => {
  describe('calculateSubtotal', () => {
    it('should calculate subtotal correctly for single item', () => {
      const items: Partial<OrderItem>[] = [{ totalPrice: 25.0 }];

      const result = OrderCalculationService.calculateSubtotal(items);

      expect(result).toBe(25.0);
    });

    it('should calculate subtotal correctly for multiple items', () => {
      const items: Partial<OrderItem>[] = [
        { totalPrice: 25.0 },
        { totalPrice: 15.0 },
        { totalPrice: 30.5 },
      ];

      const result = OrderCalculationService.calculateSubtotal(items);

      expect(result).toBe(70.5);
    });

    it('should return 0 for empty items array', () => {
      const items: Partial<OrderItem>[] = [];

      const result = OrderCalculationService.calculateSubtotal(items);

      expect(result).toBe(0);
    });

    it('should handle items with undefined totalPrice', () => {
      const items: Partial<OrderItem>[] = [
        { totalPrice: 25.0 },
        { totalPrice: undefined },
        { totalPrice: 15.0 },
      ];

      const result = OrderCalculationService.calculateSubtotal(items);

      expect(result).toBe(40.0);
    });

    it('should handle decimal precision correctly', () => {
      const items: Partial<OrderItem>[] = [
        { totalPrice: 10.99 },
        { totalPrice: 20.99 },
        { totalPrice: 5.01 },
      ];

      const result = OrderCalculationService.calculateSubtotal(items);

      expect(result).toBeCloseTo(36.99, 2);
    });
  });

  describe('calculateTotal', () => {
    it('should add delivery fee to subtotal', () => {
      const subtotal = 50.0;
      const deliveryFee = 5.0;

      const result = OrderCalculationService.calculateTotal(
        subtotal,
        deliveryFee,
      );

      expect(result).toBe(55.0);
    });

    it('should handle zero delivery fee', () => {
      const subtotal = 50.0;
      const deliveryFee = 0;

      const result = OrderCalculationService.calculateTotal(
        subtotal,
        deliveryFee,
      );

      expect(result).toBe(50.0);
    });

    it('should handle zero subtotal', () => {
      const subtotal = 0;
      const deliveryFee = 5.0;

      const result = OrderCalculationService.calculateTotal(
        subtotal,
        deliveryFee,
      );

      expect(result).toBe(5.0);
    });

    it('should handle decimal values correctly', () => {
      const subtotal = 49.99;
      const deliveryFee = 5.5;

      const result = OrderCalculationService.calculateTotal(
        subtotal,
        deliveryFee,
      );

      expect(result).toBe(55.49);
    });
  });

  describe('validateItemsPricing', () => {
    it('should return true for correct item pricing', () => {
      const items: Partial<OrderItem>[] = [
        { quantity: 2, unitPrice: 25.0, totalPrice: 50.0 },
        { quantity: 1, unitPrice: 15.0, totalPrice: 15.0 },
      ];

      const result = OrderCalculationService.validateItemsPricing(items);

      expect(result).toBe(true);
    });

    it('should return false for incorrect item pricing', () => {
      const items: Partial<OrderItem>[] = [
        { quantity: 2, unitPrice: 25.0, totalPrice: 40.0 }, // Wrong total
      ];

      const result = OrderCalculationService.validateItemsPricing(items);

      expect(result).toBe(false);
    });

    it('should return false when quantity is missing', () => {
      const items: Partial<OrderItem>[] = [
        { unitPrice: 25.0, totalPrice: 50.0 },
      ];

      const result = OrderCalculationService.validateItemsPricing(items);

      expect(result).toBe(false);
    });

    it('should return false when unitPrice is missing', () => {
      const items: Partial<OrderItem>[] = [{ quantity: 2, totalPrice: 50.0 }];

      const result = OrderCalculationService.validateItemsPricing(items);

      expect(result).toBe(false);
    });

    it('should handle decimal precision in validation', () => {
      const items: Partial<OrderItem>[] = [
        { quantity: 3, unitPrice: 10.99, totalPrice: 32.97 },
      ];

      const result = OrderCalculationService.validateItemsPricing(items);

      expect(result).toBe(true);
    });

    it('should return true for empty items array', () => {
      const items: Partial<OrderItem>[] = [];

      const result = OrderCalculationService.validateItemsPricing(items);

      expect(result).toBe(true);
    });
  });

  describe('isTotalCorrect', () => {
    it('should return true when total matches subtotal + delivery fee', () => {
      const subtotal = 50.0;
      const deliveryFee = 5.0;
      const totalAmount = 55.0;

      const result = OrderCalculationService.isTotalCorrect(
        subtotal,
        deliveryFee,
        totalAmount,
      );

      expect(result).toBe(true);
    });

    it('should return false when total is incorrect', () => {
      const subtotal = 50.0;
      const deliveryFee = 5.0;
      const totalAmount = 60.0; // Wrong

      const result = OrderCalculationService.isTotalCorrect(
        subtotal,
        deliveryFee,
        totalAmount,
      );

      expect(result).toBe(false);
    });

    it('should return false when total is less than expected', () => {
      const subtotal = 50.0;
      const deliveryFee = 5.0;
      const totalAmount = 50.0; // Missing delivery fee

      const result = OrderCalculationService.isTotalCorrect(
        subtotal,
        deliveryFee,
        totalAmount,
      );

      expect(result).toBe(false);
    });

    it('should handle decimal precision correctly', () => {
      const subtotal = 49.99;
      const deliveryFee = 5.5;
      const totalAmount = 55.49;

      const result = OrderCalculationService.isTotalCorrect(
        subtotal,
        deliveryFee,
        totalAmount,
      );

      expect(result).toBe(true);
    });
  });

  describe('meetsMinimumOrder', () => {
    it('should return true when total meets minimum order', () => {
      const total = 50.0;
      const minimumOrder = 30.0;

      const result = OrderCalculationService.meetsMinimumOrder(
        total,
        minimumOrder,
      );

      expect(result).toBe(true);
    });

    it('should return true when total equals minimum order', () => {
      const total = 30.0;
      const minimumOrder = 30.0;

      const result = OrderCalculationService.meetsMinimumOrder(
        total,
        minimumOrder,
      );

      expect(result).toBe(true);
    });

    it('should return false when total is below minimum order', () => {
      const total = 20.0;
      const minimumOrder = 30.0;

      const result = OrderCalculationService.meetsMinimumOrder(
        total,
        minimumOrder,
      );

      expect(result).toBe(false);
    });

    it('should return true when minimum order is not specified (defaults to 0)', () => {
      const total = 10.0;

      const result = OrderCalculationService.meetsMinimumOrder(total);

      expect(result).toBe(true);
    });

    it('should return true when total is zero and minimum is zero', () => {
      const total = 0;
      const minimumOrder = 0;

      const result = OrderCalculationService.meetsMinimumOrder(
        total,
        minimumOrder,
      );

      expect(result).toBe(true);
    });
  });
});

