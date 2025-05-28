import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { OrderServicePort } from '@/application/ports/in/services/order.service.port';
import { OrderRepositoryPort } from '@/application/ports/out/repositories/order.repository.port';
import { CreateOrderDto } from '@/application/dtos/order';
import { UpdateOrderStatusDto } from '@/application/dtos/order';
import {
  Order,
  OrderItem,
  OrderBusinessRules,
  OrderCalculationService,
  PixPaymentData,
  CashPaymentData,
} from '@/domain/orders';
import { OrderItemSnapshot } from '@/shared/utils/order.utils';
import { v7 } from 'uuid';
import { PixProviderPort } from '../ports/out/payment/pix-provider.port';
import { MenuItemRepositoryPort } from '../ports/out/repositories/menu-item.repository.port';
import { FullOrderDto } from '../dtos/order';
import { PaginationOutputDto } from '@/shared/utils/pagination.utils';
import { DeliveryServicePort } from '../ports/in/services/delivery.service.port';
import { RestaurantServicePort } from '../ports/in/services/restaurant.service.port';

@Injectable()
export class OrderService extends OrderServicePort {
  constructor(
    private readonly orderRepository: OrderRepositoryPort,
    private readonly deliveryService: DeliveryServicePort,
    private readonly menuItemRepository: MenuItemRepositoryPort,
    private readonly pixProviderPort: PixProviderPort,
    private readonly restaurantService: RestaurantServicePort,
  ) {
    super();
  }

  async create(customerId: string, data: CreateOrderDto): Promise<Order> {
    const restaurant = await this.restaurantService.findById(data.restaurantId);

    if (!restaurant) throw new NotFoundException('Restaurant not found');

    const orderItems: Partial<OrderItem>[] = [];
    for (const item of data.items) {
      const menuItem = await this.menuItemRepository.findByIdAndRestaurantId(
        item.menuItemId,
        data.restaurantId,
      );

      if (!menuItem)
        throw new NotFoundException(
          `Could not find item ${item.menuItemId} in restaurant ${data.restaurantId}`,
        );

      orderItems.push({
        id: v7(),
        ...OrderItemSnapshot.createFromMenuItem(menuItem, item.quantity),
        notes: item.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const subtotal = OrderCalculationService.calculateSubtotal(orderItems);
    const totalAmount = OrderCalculationService.calculateTotal(
      subtotal,
      restaurant.deliveryFee,
    );

    if (
      !OrderCalculationService.isTotalCorrect(
        subtotal,
        restaurant.deliveryFee,
        totalAmount,
      )
    ) {
      throw new BadRequestException('Error on order price calculation');
    }

    const orderId = v7();
    let paymentData: PixPaymentData | CashPaymentData;

    if (data.payment.type === 'PIX') {
      const pixData = await this.pixProviderPort.generateQrCode({
        amount: totalAmount,
        orderId: orderId,
        expirationMinutes: 5,
      });
      paymentData = {
        qrCodeImage: pixData.qrCodeBase64,
        pixCode: pixData.qrCode,
        expiresAt: pixData.expiresAt,
      } as PixPaymentData;
    } else if (data.payment.type === 'CASH') {
      paymentData = { changeFor: data.payment.changeFor };
    }

    // TODO new status pending payment
    return await this.orderRepository.createWithItems(
      {
        id: orderId,
        customerId,
        restaurantId: data.restaurantId,
        deliveryAddressId: data.deliveryAddressId,
        paymentType: data.payment.type,
        paymentMethodId:
          data.payment.type === 'STORED_CARD'
            ? data.payment.paymentMethodId
            : undefined,
        paymentData,
        status: 'PENDING',
        subtotal,
        deliveryFee: restaurant.deliveryFee,
        totalAmount,
        notes: data.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      orderItems as OrderItem[],
    );
  }

  async findById(orderId: string): Promise<FullOrderDto> {
    const order = await this.orderRepository.findFullOrderById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async findByCustomer(
    customerId: string,
    page: number,
    pageSize: number,
  ): Promise<PaginationOutputDto<Order>> {
    return this.orderRepository.findByCustomerId(customerId, page, pageSize);
  }

  async findByRestaurant(
    restaurantId: string,
    page: number,
    pageSize: number,
  ): Promise<PaginationOutputDto<Order>> {
    return this.orderRepository.findByRestaurantId(
      restaurantId,
      page,
      pageSize,
    );
  }

  private async updateStatus(
    orderId: string,
    data: UpdateOrderStatusDto,
  ): Promise<void> {
    const order = await this.findById(orderId);

    if (
      !OrderBusinessRules.isValidStatusTransition(order.status, data.newStatus)
    ) {
      throw new BadRequestException(
        `Cannot change status from ${order.status} to ${data.newStatus}`,
      );
    }

    const updateData: Partial<Order> = {
      status: data.newStatus,
      updatedAt: new Date(),
    };

    switch (data.newStatus) {
      case 'PREPARING':
        updateData.acceptedAt = new Date();
        updateData.estimatedDeliveryTime =
          OrderBusinessRules.calculateEstimatedDeliveryTime(
            order.restaurant.deliveryTimeMax,
            updateData.acceptedAt,
          );
        break;
      case 'READY':
        updateData.readyAt = new Date();
        break;
      case 'OUT_FOR_DELIVERY':
        updateData.pickedUpAt = new Date();
        break;
      case 'DELIVERED':
        updateData.deliveredAt = new Date();
        break;
      case 'CANCELLED':
        updateData.cancelledAt = new Date();
        updateData.cancellationReason = data.reason;
        break;
    }

    await this.orderRepository.update(orderId, updateData);
  }

  /* =================== CUSTOMER METHODS =================== */

  async cancelCustomerOrder(
    customerId: string,
    orderId: string,
    reason: string,
  ): Promise<void> {
    const order = await this.findById(orderId);

    if (order.customerId !== customerId) {
      throw new ForbiddenException('You can only cancel your own orders');
    }

    return this.updateStatus(orderId, {
      newStatus: 'CANCELLED',
      reason: reason || 'Cancelled by customer',
    });
  }

  /* =================== RESTAURANT METHODS =================== */

  async updateRestaurantOrderStatus(
    restaurantId: string,
    orderId: string,
    data: UpdateOrderStatusDto,
  ): Promise<void> {
    const order = await this.findById(orderId);

    if (order.restaurantId !== restaurantId) {
      throw new ForbiddenException('Order does not belong to this restaurant');
    }

    if (!OrderBusinessRules.canRestaurantUpdateStatus(data.newStatus)) {
      throw new ForbiddenException(
        `Restaurant cannot set order status to ${data.newStatus}. Allowed statuses: ${OrderBusinessRules.getRestaurantAllowedStatuses().join(', ')}`,
      );
    }

    return this.updateStatus(orderId, data);
  }

  async markOrderAsReady(restaurantId: string, orderId: string): Promise<void> {
    await this.updateRestaurantOrderStatus(restaurantId, orderId, {
      newStatus: 'READY',
    });

    await this.deliveryService.createDelivery(orderId);
  }
}
