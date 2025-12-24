import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

import { OrderService } from '@/application/services/order.service';
import { OrderRepositoryPort } from '@/application/ports/out/repositories/order.repository.port';
import { MenuItemRepositoryPort } from '@/application/ports/out/repositories/menu-item.repository.port';
import { PixProviderPort } from '@/application/ports/out/payment/pix-provider.port';
import { DeliveryServicePort } from '@/application/ports/in/services/delivery.service.port';
import { RestaurantServicePort } from '@/application/ports/in/services/restaurant.service.port';
import { OrdersEventBusPort } from '@/application/ports/out/event-bus';
import {
  createMockOrderRepository,
  createMockMenuItemRepository,
  createMockPixProvider,
  createMockDeliveryService,
  createMockRestaurantService,
  createMockOrdersEventBus,
} from '@/test/helpers/mocks';
import {
  createTestUser,
  createTestOrder,
  createTestRestaurant,
  createTestMenuItem,
} from '@/test/helpers/factories';
import { CreateOrderDto } from '@/application/dtos/order';

describe('OrderService', () => {
  let service: OrderService;
  let mockOrderRepository: ReturnType<typeof createMockOrderRepository>;
  let mockMenuItemRepository: ReturnType<typeof createMockMenuItemRepository>;
  let mockPixProvider: ReturnType<typeof createMockPixProvider>;
  let mockDeliveryService: ReturnType<typeof createMockDeliveryService>;
  let mockRestaurantService: ReturnType<typeof createMockRestaurantService>;
  let mockEventBus: ReturnType<typeof createMockOrdersEventBus>;

  beforeEach(async () => {
    mockOrderRepository = createMockOrderRepository();
    mockMenuItemRepository = createMockMenuItemRepository();
    mockPixProvider = createMockPixProvider();
    mockDeliveryService = createMockDeliveryService();
    mockRestaurantService = createMockRestaurantService();
    mockEventBus = createMockOrdersEventBus();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: OrderRepositoryPort,
          useValue: mockOrderRepository,
        },
        {
          provide: MenuItemRepositoryPort,
          useValue: mockMenuItemRepository,
        },
        {
          provide: PixProviderPort,
          useValue: mockPixProvider,
        },
        {
          provide: DeliveryServicePort,
          useValue: mockDeliveryService,
        },
        {
          provide: RestaurantServicePort,
          useValue: mockRestaurantService,
        },
        {
          provide: OrdersEventBusPort,
          useValue: mockEventBus,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an order with correct total calculation', async () => {
      // Arrange
      const customer = createTestUser();
      const restaurant = createTestRestaurant({
        deliveryFee: 5.0,
      });
      const menuItem1 = createTestMenuItem({
        id: 'item-1',
        price: 25.0,
      });
      const menuItem2 = createTestMenuItem({
        id: 'item-2',
        price: 15.0,
      });

      const createOrderDto: CreateOrderDto = {
        restaurantId: restaurant.id,
        deliveryAddressId: 'address-1',
        items: [
          { menuItemId: menuItem1.id, quantity: 2, notes: 'No onions' },
          { menuItemId: menuItem2.id, quantity: 1 },
        ],
        payment: {
          type: 'PIX',
        },
      };

      const expectedSubtotal = 25.0 * 2 + 15.0 * 1; // 65.0
      const expectedTotal = expectedSubtotal + restaurant.deliveryFee; // 70.0

      const createdOrder = {
        ...createTestOrder({
          customerId: customer.id,
          restaurantId: restaurant.id,
          subtotal: expectedSubtotal,
          deliveryFee: restaurant.deliveryFee,
          totalAmount: expectedTotal,
        }),
        customer,
        restaurant,
        orderItems: [],
      };

      mockRestaurantService.findById.mockResolvedValue(restaurant as any);
      mockMenuItemRepository.findByIdAndRestaurantId
        .mockResolvedValueOnce(menuItem1)
        .mockResolvedValueOnce(menuItem2);
      mockPixProvider.generateQrCode.mockResolvedValue({
        qrCode: 'pix-code-123',
        qrCodeBase64: 'base64-image',
        pixKey: 'pix-key-123',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      });
      mockOrderRepository.createWithItems.mockResolvedValue(
        createdOrder as any,
      );
      mockEventBus.emitOrderCreated.mockResolvedValue(undefined);

      // Act
      const result = await service.create(customer, createOrderDto);

      // Assert
      expect(result.subtotal).toBe(expectedSubtotal);
      expect(result.deliveryFee).toBe(restaurant.deliveryFee);
      expect(result.totalAmount).toBe(expectedTotal);
      expect(mockOrderRepository.createWithItems).toHaveBeenCalled();
      expect(mockEventBus.emitOrderCreated).toHaveBeenCalled();
    });

    it('should throw NotFoundException if restaurant does not exist', async () => {
      // Arrange
      const customer = createTestUser();
      const createOrderDto: CreateOrderDto = {
        restaurantId: 'non-existent-restaurant',
        deliveryAddressId: 'address-1',
        items: [{ menuItemId: 'item-1', quantity: 1 }],
        payment: { type: 'CASH', changeFor: 50.0 },
      };

      mockRestaurantService.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(customer, createOrderDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(customer, createOrderDto)).rejects.toThrow(
        'Restaurant not found',
      );
      expect(mockOrderRepository.createWithItems).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if menu item does not exist', async () => {
      // Arrange
      const customer = createTestUser();
      const restaurant = createTestRestaurant();
      const createOrderDto: CreateOrderDto = {
        restaurantId: restaurant.id,
        deliveryAddressId: 'address-1',
        items: [{ menuItemId: 'non-existent-item', quantity: 1 }],
        payment: { type: 'CASH', changeFor: 50.0 },
      };

      mockRestaurantService.findById.mockResolvedValue(restaurant as any);
      mockMenuItemRepository.findByIdAndRestaurantId.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(customer, createOrderDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockOrderRepository.createWithItems).not.toHaveBeenCalled();
    });

    it('should generate PIX QR code for PIX payment', async () => {
      // Arrange
      const customer = createTestUser();
      const restaurant = createTestRestaurant({ deliveryFee: 5.0 });
      const menuItem = createTestMenuItem({ price: 25.0 });
      const createOrderDto: CreateOrderDto = {
        restaurantId: restaurant.id,
        deliveryAddressId: 'address-1',
        items: [{ menuItemId: menuItem.id, quantity: 2 }],
        payment: { type: 'PIX' },
      };

      const expectedTotal = 25.0 * 2 + 5.0; // 55.0

      mockRestaurantService.findById.mockResolvedValue(restaurant as any);
      mockMenuItemRepository.findByIdAndRestaurantId.mockResolvedValue(
        menuItem,
      );
      mockPixProvider.generateQrCode.mockResolvedValue({
        qrCode: 'pix-code',
        qrCodeBase64: 'base64',
        pixKey: 'pix-key',
        expiresAt: new Date(),
      });
      mockOrderRepository.createWithItems.mockResolvedValue({
        ...createTestOrder(),
        customer,
        restaurant,
        orderItems: [],
      } as any);
      mockEventBus.emitOrderCreated.mockResolvedValue(undefined);

      // Act
      await service.create(customer, createOrderDto);

      // Assert
      expect(mockPixProvider.generateQrCode).toHaveBeenCalledWith({
        amount: expectedTotal,
        orderId: expect.any(String),
        expirationMinutes: 5,
      });
    });

    it('should create order with CASH payment data', async () => {
      // Arrange
      const customer = createTestUser();
      const restaurant = createTestRestaurant({ deliveryFee: 5.0 });
      const menuItem = createTestMenuItem({ price: 20.0 });
      const createOrderDto: CreateOrderDto = {
        restaurantId: restaurant.id,
        deliveryAddressId: 'address-1',
        items: [{ menuItemId: menuItem.id, quantity: 2 }],
        payment: { type: 'CASH', changeFor: 100.0 },
      };

      mockRestaurantService.findById.mockResolvedValue(restaurant as any);
      mockMenuItemRepository.findByIdAndRestaurantId.mockResolvedValue(
        menuItem,
      );
      mockOrderRepository.createWithItems.mockResolvedValue({
        ...createTestOrder(),
        customer,
        restaurant,
        orderItems: [],
      } as any);
      mockEventBus.emitOrderCreated.mockResolvedValue(undefined);

      // Act
      await service.create(customer, createOrderDto);

      // Assert
      expect(mockOrderRepository.createWithItems).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentType: 'CASH',
          paymentData: { changeFor: 100.0 },
        }),
        expect.any(Array),
      );
    });
  });

  describe('cancelCustomerOrder', () => {
    it('should allow customer to cancel their own order', async () => {
      // Arrange
      const customer = createTestUser({ id: 'customer-1' });
      const order = {
        ...createTestOrder({
          id: 'order-1',
          customerId: customer.id,
          status: 'PENDING',
        }),
        customer,
        restaurant: createTestRestaurant(),
        orderItems: [],
      };

      mockOrderRepository.findFullOrderById.mockResolvedValue(order as any);
      mockOrderRepository.update.mockResolvedValue(order);
      mockEventBus.emitOrderStatusUpdated.mockResolvedValue(undefined);

      // Act
      await service.cancelCustomerOrder(
        customer.id,
        order.id,
        'Changed my mind',
      );

      // Assert
      expect(mockOrderRepository.update).toHaveBeenCalledWith(
        order.id,
        expect.objectContaining({
          status: 'CANCELLED',
          cancellationReason: 'Changed my mind',
          cancelledAt: expect.any(Date),
        }),
      );
    });

    it('should throw ForbiddenException if customer tries to cancel another customer order', async () => {
      // Arrange
      const customer = createTestUser({ id: 'customer-1' });
      const otherCustomer = createTestUser({ id: 'customer-2' });
      const order = {
        ...createTestOrder({
          customerId: otherCustomer.id,
        }),
        customer: otherCustomer,
        restaurant: createTestRestaurant(),
        orderItems: [],
      };

      mockOrderRepository.findFullOrderById.mockResolvedValue(order as any);

      // Act & Assert
      await expect(
        service.cancelCustomerOrder(customer.id, order.id, 'reason'),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.cancelCustomerOrder(customer.id, order.id, 'reason'),
      ).rejects.toThrow('You can only cancel your own orders');
    });
  });

  describe('updateRestaurantOrderStatus', () => {
    it('should allow restaurant to update order status to PREPARING', async () => {
      // Arrange
      const restaurant = createTestRestaurant({ id: 'restaurant-1' });
      const order = {
        ...createTestOrder({
          restaurantId: restaurant.id,
          status: 'PENDING',
        }),
        customer: createTestUser(),
        restaurant,
        orderItems: [],
      };

      mockOrderRepository.findFullOrderById.mockResolvedValue(order as any);
      mockOrderRepository.update.mockResolvedValue(order);
      mockEventBus.emitOrderStatusUpdated.mockResolvedValue(undefined);

      // Act
      await service.updateRestaurantOrderStatus(restaurant.id, order.id, {
        newStatus: 'PREPARING',
      });

      // Assert
      expect(mockOrderRepository.update).toHaveBeenCalledWith(
        order.id,
        expect.objectContaining({
          status: 'PREPARING',
          acceptedAt: expect.any(Date),
        }),
      );
    });

    it('should throw ForbiddenException if restaurant tries to update order from another restaurant', async () => {
      // Arrange
      const restaurant1 = createTestRestaurant({ id: 'restaurant-1' });
      const restaurant2 = createTestRestaurant({ id: 'restaurant-2' });
      const order = {
        ...createTestOrder({ restaurantId: restaurant2.id }),
        customer: createTestUser(),
        restaurant: restaurant2,
        orderItems: [],
      };

      mockOrderRepository.findFullOrderById.mockResolvedValue(order as any);

      // Act & Assert
      await expect(
        service.updateRestaurantOrderStatus(restaurant1.id, order.id, {
          newStatus: 'PREPARING',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if restaurant tries to set invalid status', async () => {
      // Arrange
      const restaurant = createTestRestaurant({ id: 'restaurant-1' });
      const order = {
        ...createTestOrder({ restaurantId: restaurant.id, status: 'PENDING' }),
        customer: createTestUser(),
        restaurant,
        orderItems: [],
      };

      mockOrderRepository.findFullOrderById.mockResolvedValue(order as any);

      // Act & Assert
      await expect(
        service.updateRestaurantOrderStatus(restaurant.id, order.id, {
          newStatus: 'DELIVERED', // Only delivery person can set this
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      // Arrange
      const restaurant = createTestRestaurant({ id: 'restaurant-1' });
      const order = {
        ...createTestOrder({
          restaurantId: restaurant.id,
          status: 'DELIVERED',
        }),
        customer: createTestUser(),
        restaurant,
        orderItems: [],
      };

      mockOrderRepository.findFullOrderById.mockResolvedValue(order as any);

      // Act & Assert
      await expect(
        service.updateRestaurantOrderStatus(restaurant.id, order.id, {
          newStatus: 'PREPARING',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('markOrderAsReady', () => {
    it('should mark order as READY and create delivery', async () => {
      // Arrange
      const restaurant = createTestRestaurant({ id: 'restaurant-1' });
      const order = {
        ...createTestOrder({
          id: 'order-1',
          restaurantId: restaurant.id,
          status: 'PREPARING',
        }),
        customer: createTestUser(),
        restaurant,
        orderItems: [],
      };

      mockOrderRepository.findFullOrderById.mockResolvedValue(order as any);
      mockOrderRepository.update.mockResolvedValue(order);
      mockEventBus.emitOrderStatusUpdated.mockResolvedValue(undefined);
      mockDeliveryService.createDelivery.mockResolvedValue(undefined);

      // Act
      await service.markOrderAsReady(restaurant.id, order.id);

      // Assert
      expect(mockOrderRepository.update).toHaveBeenCalledWith(
        order.id,
        expect.objectContaining({
          status: 'READY',
          readyAt: expect.any(Date),
        }),
      );
      expect(mockDeliveryService.createDelivery).toHaveBeenCalledWith(order.id);
    });
  });

  describe('Edge Cases and Validations', () => {
    describe('create with invalid quantities', () => {
      it('should throw error for zero quantity', async () => {
        // Arrange
        const customer = createTestUser();
        const restaurant = createTestRestaurant({ deliveryFee: 5.0 });
        const menuItem = createTestMenuItem({ price: 25.0 });

        const createOrderDto: CreateOrderDto = {
          restaurantId: restaurant.id,
          deliveryAddressId: 'address-1',
          items: [{ menuItemId: menuItem.id, quantity: 0 }], // Zero quantity
          payment: { type: 'CASH', changeFor: 50.0 },
        };

        mockRestaurantService.findById.mockResolvedValue(restaurant as any);
        mockMenuItemRepository.findByIdAndRestaurantId.mockResolvedValue(
          menuItem,
        );

        // Act & Assert
        // Note: This would require validation in the DTO or service
        // Currently the service doesn't validate this, but it should
        await expect(
          service.create(customer, createOrderDto),
        ).rejects.toThrow();
      });

      it('should throw error for negative quantity', async () => {
        // Arrange
        const customer = createTestUser();
        const restaurant = createTestRestaurant({ deliveryFee: 5.0 });
        const menuItem = createTestMenuItem({ price: 25.0 });

        const createOrderDto: CreateOrderDto = {
          restaurantId: restaurant.id,
          deliveryAddressId: 'address-1',
          items: [{ menuItemId: menuItem.id, quantity: -1 }], // Negative quantity
          payment: { type: 'CASH', changeFor: 50.0 },
        };

        mockRestaurantService.findById.mockResolvedValue(restaurant as any);
        mockMenuItemRepository.findByIdAndRestaurantId.mockResolvedValue(
          menuItem,
        );

        // Act & Assert
        await expect(
          service.create(customer, createOrderDto),
        ).rejects.toThrow();
      });
    });

    describe('create with empty items array', () => {
      it('should throw error when items array is empty', async () => {
        // Arrange
        const customer = createTestUser();
        const restaurant = createTestRestaurant({ deliveryFee: 5.0 });

        const createOrderDto: CreateOrderDto = {
          restaurantId: restaurant.id,
          deliveryAddressId: 'address-1',
          items: [], // Empty items
          payment: { type: 'CASH', changeFor: 50.0 },
        };

        mockRestaurantService.findById.mockResolvedValue(restaurant as any);

        // Act & Assert
        await expect(
          service.create(customer, createOrderDto),
        ).rejects.toThrow();
      });
    });

    describe('create with very large order', () => {
      it('should handle order with many items', async () => {
        // Arrange
        const customer = createTestUser();
        const restaurant = createTestRestaurant({ deliveryFee: 5.0 });
        const menuItems = Array.from({ length: 50 }, (_, i) =>
          createTestMenuItem({ id: `item-${i}`, price: 10.0 }),
        );

        const createOrderDto: CreateOrderDto = {
          restaurantId: restaurant.id,
          deliveryAddressId: 'address-1',
          items: menuItems.map((item) => ({
            menuItemId: item.id,
            quantity: 1,
          })),
          payment: { type: 'CASH', changeFor: 1000.0 },
        };

        const expectedSubtotal = 10.0 * 50; // 500.0
        const expectedTotal = expectedSubtotal + restaurant.deliveryFee; // 505.0

        mockRestaurantService.findById.mockResolvedValue(restaurant as any);
        menuItems.forEach((menuItem) => {
          mockMenuItemRepository.findByIdAndRestaurantId.mockResolvedValue(
            menuItem,
          );
        });

        const createdOrder = {
          ...createTestOrder({
            customerId: customer.id,
            restaurantId: restaurant.id,
            subtotal: expectedSubtotal,
            deliveryFee: restaurant.deliveryFee,
            totalAmount: expectedTotal,
          }),
          customer,
          restaurant,
          orderItems: [],
        };

        mockPixProvider.generateQrCode.mockResolvedValue({
          qrCode: 'pix-code',
          qrCodeBase64: 'base64',
          pixKey: 'pix-key',
          expiresAt: new Date(),
        });
        mockOrderRepository.createWithItems.mockResolvedValue(
          createdOrder as any,
        );
        mockEventBus.emitOrderCreated.mockResolvedValue(undefined);

        // Act
        const result = await service.create(customer, createOrderDto);

        // Assert
        expect(result.subtotal).toBe(expectedSubtotal);
        expect(result.totalAmount).toBe(expectedTotal);
      });
    });

    describe('create with decimal precision', () => {
      it('should handle prices with decimal precision correctly', async () => {
        // Arrange
        const customer = createTestUser();
        const restaurant = createTestRestaurant({ deliveryFee: 4.99 });
        const menuItem1 = createTestMenuItem({ id: 'item-1', price: 12.99 });
        const menuItem2 = createTestMenuItem({ id: 'item-2', price: 8.5 });

        const createOrderDto: CreateOrderDto = {
          restaurantId: restaurant.id,
          deliveryAddressId: 'address-1',
          items: [
            { menuItemId: menuItem1.id, quantity: 3 }, // 38.97
            { menuItemId: menuItem2.id, quantity: 2 }, // 17.00
          ],
          payment: { type: 'PIX' },
        };

        const expectedSubtotal = 38.97 + 17.0; // 55.97
        const expectedTotal = expectedSubtotal + 4.99; // 60.96

        mockRestaurantService.findById.mockResolvedValue(restaurant as any);
        mockMenuItemRepository.findByIdAndRestaurantId
          .mockResolvedValueOnce(menuItem1)
          .mockResolvedValueOnce(menuItem2);

        const createdOrder = {
          ...createTestOrder({
            customerId: customer.id,
            restaurantId: restaurant.id,
            subtotal: expectedSubtotal,
            deliveryFee: restaurant.deliveryFee,
            totalAmount: expectedTotal,
          }),
          customer,
          restaurant,
          orderItems: [],
        };

        mockPixProvider.generateQrCode.mockResolvedValue({
          qrCode: 'pix-code',
          qrCodeBase64: 'base64',
          pixKey: 'pix-key',
          expiresAt: new Date(),
        });
        mockOrderRepository.createWithItems.mockResolvedValue(
          createdOrder as any,
        );
        mockEventBus.emitOrderCreated.mockResolvedValue(undefined);

        // Act
        const result = await service.create(customer, createOrderDto);

        // Assert
        expect(result.subtotal).toBeCloseTo(expectedSubtotal, 2);
        expect(result.totalAmount).toBeCloseTo(expectedTotal, 2);
      });
    });

    describe('cancelCustomerOrder with different order statuses', () => {
      it('should allow cancelling PENDING order', async () => {
        // Arrange
        const customer = createTestUser({ id: 'customer-1' });
        const order = {
          ...createTestOrder({
            id: 'order-1',
            customerId: customer.id,
            status: 'PENDING',
          }),
          customer,
          restaurant: createTestRestaurant(),
          orderItems: [],
        };

        mockOrderRepository.findFullOrderById.mockResolvedValue(order as any);
        mockOrderRepository.update.mockResolvedValue(order);
        mockEventBus.emitOrderStatusUpdated.mockResolvedValue(undefined);

        // Act
        await service.cancelCustomerOrder(customer.id, order.id, 'Test reason');

        // Assert
        expect(mockOrderRepository.update).toHaveBeenCalledWith(
          order.id,
          expect.objectContaining({
            status: 'CANCELLED',
          }),
        );
      });

      it('should allow cancelling PREPARING order', async () => {
        // Arrange
        const customer = createTestUser({ id: 'customer-1' });
        const order = {
          ...createTestOrder({
            id: 'order-1',
            customerId: customer.id,
            status: 'PREPARING',
          }),
          customer,
          restaurant: createTestRestaurant(),
          orderItems: [],
        };

        mockOrderRepository.findFullOrderById.mockResolvedValue(order as any);
        mockOrderRepository.update.mockResolvedValue(order);
        mockEventBus.emitOrderStatusUpdated.mockResolvedValue(undefined);

        // Act
        await service.cancelCustomerOrder(
          customer.id,
          order.id,
          'Changed mind',
        );

        // Assert
        expect(mockOrderRepository.update).toHaveBeenCalledWith(
          order.id,
          expect.objectContaining({
            status: 'CANCELLED',
            cancellationReason: 'Changed mind',
          }),
        );
      });

      it('should not allow cancelling DELIVERED order', async () => {
        // Arrange
        const customer = createTestUser({ id: 'customer-1' });
        const order = {
          ...createTestOrder({
            id: 'order-1',
            customerId: customer.id,
            status: 'DELIVERED',
          }),
          customer,
          restaurant: createTestRestaurant(),
          orderItems: [],
        };

        mockOrderRepository.findFullOrderById.mockResolvedValue(order as any);

        // Act & Assert
        await expect(
          service.cancelCustomerOrder(customer.id, order.id, 'reason'),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('concurrent status updates', () => {
      it('should handle sequential status updates correctly', async () => {
        // Arrange
        const restaurant = createTestRestaurant({ id: 'restaurant-1' });
        const order = {
          ...createTestOrder({
            restaurantId: restaurant.id,
            status: 'PENDING',
          }),
          customer: createTestUser(),
          restaurant,
          orderItems: [],
        };

        mockOrderRepository.findFullOrderById.mockResolvedValue(order as any);
        mockOrderRepository.update.mockResolvedValue({
          ...order,
          status: 'PREPARING',
        });
        mockEventBus.emitOrderStatusUpdated.mockResolvedValue(undefined);

        // Act - First update
        await service.updateRestaurantOrderStatus(restaurant.id, order.id, {
          newStatus: 'PREPARING',
        });

        // Update mock to reflect new status
        mockOrderRepository.findFullOrderById.mockResolvedValue({
          ...order,
          status: 'PREPARING',
        } as any);
        mockOrderRepository.update.mockResolvedValue({
          ...order,
          status: 'READY',
        });

        // Act - Second update
        await service.updateRestaurantOrderStatus(restaurant.id, order.id, {
          newStatus: 'READY',
        });

        // Assert
        expect(mockOrderRepository.update).toHaveBeenCalledTimes(2);
      });
    });
  });
});

