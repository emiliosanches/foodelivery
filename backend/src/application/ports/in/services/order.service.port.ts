import { Order } from '@/domain/orders';
import { CreateOrderDto } from '@/application/dtos/order';
import { UpdateOrderStatusDto } from '@/application/dtos/order';
import { PaginationOutputDto } from '@/shared/utils/pagination.utils';

export abstract class OrderServicePort {
  // Core methods
  abstract create(customerId: string, data: CreateOrderDto): Promise<Order>;
  abstract findById(orderId: string): Promise<Order>;
  abstract findByCustomer(
    customerId: string,
    page: number,
    pageSize: number,
  ): Promise<PaginationOutputDto<Order>>;
  abstract findByRestaurant(
    restaurantId: string,
    page: number,
    pageSize: number,
  ): Promise<PaginationOutputDto<Order>>;

  // Customer methods
  abstract cancelCustomerOrder(
    customerId: string,
    orderId: string,
    reason: string,
  ): Promise<void>;

  // Restaurant methods
  abstract updateRestaurantOrderStatus(
    restaurantId: string,
    orderId: string,
    data: UpdateOrderStatusDto,
  ): Promise<void>;
  abstract markOrderAsReady(
    restaurantId: string,
    orderId: string,
  ): Promise<void>;
}
