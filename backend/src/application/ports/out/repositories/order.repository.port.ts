import { FullOrderDto, OrderWithPartsDto } from '@/application/dtos/order';
import { Order, OrderItem, OrderStatus } from '@/domain/orders';
import { PaginationOutputDto } from '@/shared/utils/pagination.utils';

export abstract class OrderRepositoryPort {
  abstract createWithItems(order: Order, items: OrderItem[]): Promise<FullOrderDto>;
  abstract findFullOrderById(orderId: string): Promise<FullOrderDto | null>;
  abstract findByIdWithParts(
    orderId: string,
  ): Promise<OrderWithPartsDto | null>;
  abstract update(orderId: string, data: Partial<Order>): Promise<Order>;
  abstract findByCustomerId(
    customerId: string,
    page: number,
    pageSize: number,
  ): Promise<PaginationOutputDto<Order>>;
  abstract findByRestaurantId(
    restaurantId: string,
    page: number,
    pageSize: number,
  ): Promise<PaginationOutputDto<Order>>;
  abstract findByRestaurantAndStatuses(
    restaurantId: string,
    statuses: OrderStatus[],
    page: number,
    pageSize: number,
  ): Promise<PaginationOutputDto<Order>>;
  abstract getRestaurantStatsInTimeRange(
    restaurantId: string,
    start: Date,
    end: Date,
  ): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    completionRate: number;
  }>;
  abstract getMostOrderedItems(
    restaurantId: string,
    limit?: number,
  ): Promise<
    {
      menuItemId: string;
      productName: string;
      totalQuantity: number;
      totalRevenue: number;
    }[]
  >;
}
