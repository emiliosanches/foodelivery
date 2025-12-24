import { OrderBusinessRules } from './order-business-rules.service';
import { OrderStatus } from '../entities/order.entity';

describe('OrderBusinessRules', () => {
  describe('calculateEstimatedDeliveryTime', () => {
    it('should add delivery time to accepted date', () => {
      const acceptedAt = new Date('2025-12-24T12:00:00');
      const deliveryTimeMax = 30; // 30 minutes

      const result = OrderBusinessRules.calculateEstimatedDeliveryTime(
        deliveryTimeMax,
        acceptedAt,
      );

      const expected = new Date('2025-12-24T12:30:00');
      expect(result.getTime()).toBe(expected.getTime());
    });

    it('should handle large delivery times', () => {
      const acceptedAt = new Date('2025-12-24T12:00:00');
      const deliveryTimeMax = 120; // 2 hours

      const result = OrderBusinessRules.calculateEstimatedDeliveryTime(
        deliveryTimeMax,
        acceptedAt,
      );

      const expected = new Date('2025-12-24T14:00:00');
      expect(result.getTime()).toBe(expected.getTime());
    });

    it('should handle zero delivery time', () => {
      const acceptedAt = new Date('2025-12-24T12:00:00');
      const deliveryTimeMax = 0;

      const result = OrderBusinessRules.calculateEstimatedDeliveryTime(
        deliveryTimeMax,
        acceptedAt,
      );

      expect(result.getTime()).toBe(acceptedAt.getTime());
    });
  });

  describe('canRestaurantUpdateStatus', () => {
    it('should allow PREPARING status', () => {
      const result = OrderBusinessRules.canRestaurantUpdateStatus('PREPARING');
      expect(result).toBe(true);
    });

    it('should allow READY status', () => {
      const result = OrderBusinessRules.canRestaurantUpdateStatus('READY');
      expect(result).toBe(true);
    });

    it('should allow CANCELLED status', () => {
      const result = OrderBusinessRules.canRestaurantUpdateStatus('CANCELLED');
      expect(result).toBe(true);
    });

    it('should not allow PENDING status', () => {
      const result = OrderBusinessRules.canRestaurantUpdateStatus('PENDING');
      expect(result).toBe(false);
    });

    it('should not allow OUT_FOR_DELIVERY status', () => {
      const result =
        OrderBusinessRules.canRestaurantUpdateStatus('OUT_FOR_DELIVERY');
      expect(result).toBe(false);
    });

    it('should not allow DELIVERED status', () => {
      const result = OrderBusinessRules.canRestaurantUpdateStatus('DELIVERED');
      expect(result).toBe(false);
    });
  });

  describe('canDeliveryPersonUpdateStatus', () => {
    it('should allow OUT_FOR_DELIVERY status', () => {
      const result =
        OrderBusinessRules.canDeliveryPersonUpdateStatus('OUT_FOR_DELIVERY');
      expect(result).toBe(true);
    });

    it('should allow DELIVERED status', () => {
      const result =
        OrderBusinessRules.canDeliveryPersonUpdateStatus('DELIVERED');
      expect(result).toBe(true);
    });

    it('should not allow PENDING status', () => {
      const result =
        OrderBusinessRules.canDeliveryPersonUpdateStatus('PENDING');
      expect(result).toBe(false);
    });

    it('should not allow PREPARING status', () => {
      const result =
        OrderBusinessRules.canDeliveryPersonUpdateStatus('PREPARING');
      expect(result).toBe(false);
    });

    it('should not allow READY status', () => {
      const result = OrderBusinessRules.canDeliveryPersonUpdateStatus('READY');
      expect(result).toBe(false);
    });

    it('should not allow CANCELLED status', () => {
      const result =
        OrderBusinessRules.canDeliveryPersonUpdateStatus('CANCELLED');
      expect(result).toBe(false);
    });
  });

  describe('getRestaurantAllowedStatuses', () => {
    it('should return array of allowed statuses for restaurant', () => {
      const result = OrderBusinessRules.getRestaurantAllowedStatuses();

      expect(result).toEqual(['PREPARING', 'READY', 'CANCELLED']);
      expect(result.length).toBe(3);
    });

    it('should return a new array instance', () => {
      const result1 = OrderBusinessRules.getRestaurantAllowedStatuses();
      const result2 = OrderBusinessRules.getRestaurantAllowedStatuses();

      expect(result1).not.toBe(result2);
      expect(result1).toEqual(result2);
    });
  });

  describe('getDeliveryAllowedStatuses', () => {
    it('should return array of allowed statuses for delivery person', () => {
      const result = OrderBusinessRules.getDeliveryAllowedStatuses();

      expect(result).toEqual(['OUT_FOR_DELIVERY', 'DELIVERED']);
      expect(result.length).toBe(2);
    });

    it('should return a new array instance', () => {
      const result1 = OrderBusinessRules.getDeliveryAllowedStatuses();
      const result2 = OrderBusinessRules.getDeliveryAllowedStatuses();

      expect(result1).not.toBe(result2);
      expect(result1).toEqual(result2);
    });
  });

  describe('isValidStatusTransition', () => {
    describe('from PENDING', () => {
      it('should allow transition to PREPARING', () => {
        const result = OrderBusinessRules.isValidStatusTransition(
          'PENDING',
          'PREPARING',
        );
        expect(result).toBe(true);
      });

      it('should allow transition to CANCELLED', () => {
        const result = OrderBusinessRules.isValidStatusTransition(
          'PENDING',
          'CANCELLED',
        );
        expect(result).toBe(true);
      });

      it('should not allow transition to READY', () => {
        const result = OrderBusinessRules.isValidStatusTransition(
          'PENDING',
          'READY',
        );
        expect(result).toBe(false);
      });

      it('should not allow transition to OUT_FOR_DELIVERY', () => {
        const result = OrderBusinessRules.isValidStatusTransition(
          'PENDING',
          'OUT_FOR_DELIVERY',
        );
        expect(result).toBe(false);
      });

      it('should not allow transition to DELIVERED', () => {
        const result = OrderBusinessRules.isValidStatusTransition(
          'PENDING',
          'DELIVERED',
        );
        expect(result).toBe(false);
      });
    });

    describe('from PREPARING', () => {
      it('should allow transition to READY', () => {
        const result = OrderBusinessRules.isValidStatusTransition(
          'PREPARING',
          'READY',
        );
        expect(result).toBe(true);
      });

      it('should allow transition to CANCELLED', () => {
        const result = OrderBusinessRules.isValidStatusTransition(
          'PREPARING',
          'CANCELLED',
        );
        expect(result).toBe(true);
      });

      it('should not allow transition to PENDING', () => {
        const result = OrderBusinessRules.isValidStatusTransition(
          'PREPARING',
          'PENDING',
        );
        expect(result).toBe(false);
      });

      it('should not allow transition to OUT_FOR_DELIVERY', () => {
        const result = OrderBusinessRules.isValidStatusTransition(
          'PREPARING',
          'OUT_FOR_DELIVERY',
        );
        expect(result).toBe(false);
      });
    });

    describe('from READY', () => {
      it('should allow transition to OUT_FOR_DELIVERY', () => {
        const result = OrderBusinessRules.isValidStatusTransition(
          'READY',
          'OUT_FOR_DELIVERY',
        );
        expect(result).toBe(true);
      });

      it('should not allow transition to PREPARING', () => {
        const result = OrderBusinessRules.isValidStatusTransition(
          'READY',
          'PREPARING',
        );
        expect(result).toBe(false);
      });

      it('should not allow transition to CANCELLED', () => {
        const result = OrderBusinessRules.isValidStatusTransition(
          'READY',
          'CANCELLED',
        );
        expect(result).toBe(false);
      });
    });

    describe('from OUT_FOR_DELIVERY', () => {
      it('should allow transition to DELIVERED', () => {
        const result = OrderBusinessRules.isValidStatusTransition(
          'OUT_FOR_DELIVERY',
          'DELIVERED',
        );
        expect(result).toBe(true);
      });

      it('should not allow transition to any other status', () => {
        const statuses: OrderStatus[] = [
          'PENDING',
          'PREPARING',
          'READY',
          'CANCELLED',
        ];

        statuses.forEach((status) => {
          const result = OrderBusinessRules.isValidStatusTransition(
            'OUT_FOR_DELIVERY',
            status,
          );
          expect(result).toBe(false);
        });
      });
    });

    describe('from DELIVERED', () => {
      it('should not allow any transitions', () => {
        const statuses: OrderStatus[] = [
          'PENDING',
          'PREPARING',
          'READY',
          'OUT_FOR_DELIVERY',
          'CANCELLED',
        ];

        statuses.forEach((status) => {
          const result = OrderBusinessRules.isValidStatusTransition(
            'DELIVERED',
            status,
          );
          expect(result).toBe(false);
        });
      });
    });

    describe('from CANCELLED', () => {
      it('should not allow any transitions', () => {
        const statuses: OrderStatus[] = [
          'PENDING',
          'PREPARING',
          'READY',
          'OUT_FOR_DELIVERY',
          'DELIVERED',
        ];

        statuses.forEach((status) => {
          const result = OrderBusinessRules.isValidStatusTransition(
            'CANCELLED',
            status,
          );
          expect(result).toBe(false);
        });
      });
    });
  });
});

