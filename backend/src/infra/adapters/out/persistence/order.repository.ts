import { OrderWithRestaurant } from '@/application/dtos/order/order-with-relations.dto';
import { OrderRepositoryPort } from '@/application/ports/out/repositories/order.repository.port';
import { Order, OrderItem, OrderStatus } from '@/domain/orders';
import {
  PaginationOutputDto,
  buildPagination,
} from '@/shared/utils/pagination.utils';
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { JsonValue } from '@prisma/client/runtime/library';

@Injectable()
export class OrderRepositoryAdapter extends OrderRepositoryPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async createWithItems(order: Order, items: OrderItem[]): Promise<Order> {
    const result = await this.prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          id: order.id,
          customerId: order.customerId,
          restaurantId: order.restaurantId,
          deliveryAddressId: order.deliveryAddressId,
          paymentType: order.paymentType,
          paymentMethodId: order.paymentMethodId,
          paymentData: order.paymentData as JsonValue,
          status: order.status,
          subtotal: order.subtotal,
          deliveryFee: order.deliveryFee,
          totalAmount: order.totalAmount,
          notes: order.notes,
          estimatedDeliveryTime: order.estimatedDeliveryTime,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        },
      });

      // Criar os itens do pedido
      await tx.orderItem.createMany({
        data: items.map((item) => ({
          id: item.id,
          orderId: order.id,
          menuItemId: item.menuItemId,
          productName: item.productName,
          productDescription: item.productDescription,
          productImageUrl: item.productImageUrl,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          notes: item.notes,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })),
      });

      return createdOrder;
    });

    return result as Order;
  }

  async findById(orderId: string): Promise<OrderWithRestaurant | null> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        restaurant: true,
        orderItems: true,
      },
    });

    if (!order) {
      return null;
    }

    return order as OrderWithRestaurant;
  }

  async update(orderId: string, data: Partial<Order>): Promise<Order> {
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        ...data,
        paymentData: data.paymentData as JsonValue | undefined,
        updatedAt: new Date(),
      },
    });

    return updatedOrder as Order;
  }

  async findByCustomerId(
    customerId: string,
    page: number,
    pageSize: number,
  ): Promise<PaginationOutputDto<Order>> {
    const skip = (page - 1) * pageSize;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.order.count({
        where: { customerId },
      }),
    ]);

    return buildPagination(orders as Order[], total, page, pageSize);
  }

  async findByRestaurantId(
    restaurantId: string,
    page: number,
    pageSize: number,
  ): Promise<PaginationOutputDto<Order>> {
    const skip = (page - 1) * pageSize;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { restaurantId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.order.count({
        where: { restaurantId },
      }),
    ]);

    return buildPagination(orders as Order[], total, page, pageSize);
  }

  async findByRestaurantAndStatuses(
    restaurantId: string,
    statuses: OrderStatus[],
    page: number,
    pageSize: number,
  ): Promise<PaginationOutputDto<Order>> {
    const skip = (page - 1) * pageSize;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          restaurantId,
          status: {
            in: statuses,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.order.count({
        where: {
          restaurantId,
          status: {
            in: statuses,
          },
        },
      }),
    ]);

    return buildPagination(orders as Order[], total, page, pageSize);
  }

  async getRestaurantStatsInTimeRange(
    restaurantId: string,
    start: Date,
    end: Date,
  ): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    completionRate: number;
  }> {
    const [totalOrders, completedOrders, revenueResult] = await Promise.all([
      this.prisma.order.count({
        where: {
          restaurantId,
          createdAt: {
            gte: start,
            lte: end,
          },
        },
      }),
      this.prisma.order.count({
        where: {
          restaurantId,
          status: 'DELIVERED',
          createdAt: {
            gte: start,
            lte: end,
          },
        },
      }),
      this.prisma.order.aggregate({
        where: {
          restaurantId,
          status: 'DELIVERED',
          createdAt: {
            gte: start,
            lte: end,
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),
    ]);

    const totalRevenue = revenueResult._sum.totalAmount || 0;
    const averageOrderValue =
      completedOrders > 0 ? totalRevenue / completedOrders : 0;
    const completionRate =
      totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      completionRate,
    };
  }

  async getMostOrderedItems(
    restaurantId: string,
    limit: number = 10,
  ): Promise<
    {
      menuItemId: string;
      productName: string;
      totalQuantity: number;
      totalRevenue: number;
    }[]
  > {
    const result = await this.prisma.orderItem.groupBy({
      by: ['menuItemId', 'productName'],
      where: {
        order: {
          restaurantId,
          status: 'DELIVERED', // Apenas pedidos entregues
        },
      },
      _sum: {
        quantity: true,
        totalPrice: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: limit,
    });

    return result.map((item) => ({
      menuItemId: item.menuItemId,
      productName: item.productName,
      totalQuantity: item._sum.quantity || 0,
      totalRevenue: item._sum.totalPrice || 0,
    }));
  }
}
