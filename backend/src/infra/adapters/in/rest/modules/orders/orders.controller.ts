import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  HttpStatus,
  HttpCode,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/infra/adapters/in/rest/common/guards/jwt-auth.guard';
import { RestaurantOwnerGuard } from '@/infra/adapters/in/rest/common/guards/restaurant-owner.guard';
import { OrderAccessGuard } from '@/infra/adapters/in/rest/common/guards/order-access.guard';
import { OrderServicePort } from '@/application/ports/in/services/order.service.port';
import { CreateOrderDto } from '@/application/dtos/order/create-order.dto';
import { UpdateOrderStatusDto } from '@/application/dtos/order/update-order-status.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@/domain/entities/user.entity';

@Controller()
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderServicePort) {}

  /* =================== ORDERS RESOURCE =================== */

  @Post('orders')
  async createOrder(
    @CurrentUser() user: User,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    const orderData = {
      ...createOrderDto,
      customerId: user.id,
    };

    return this.orderService.create(user.id, orderData);
  }

  @Get('orders/:id')
  @UseGuards(OrderAccessGuard)
  async getOrder(@Request() req: any) {
    return req.order;
  }

  @Patch('orders/:id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelOrder(
    @CurrentUser() user: User,
    @Param('id') orderId: string,
    @Body('reason') reason: string,
  ) {
    return this.orderService.cancelCustomerOrder(user.id, orderId, reason);
  }

  /* =================== CUSTOMER RESOURCES =================== */

  @Get('customers/me/orders')
  async getMyOrders(
    @CurrentUser() user: User,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ) {
    return this.orderService.findByCustomer(user.id, page, pageSize);
  }

  /* =================== RESTAURANT RESOURCES =================== */

  @Get('restaurants/:restaurantId/orders')
  @UseGuards(RestaurantOwnerGuard)
  async getRestaurantOrders(
    @Param('restaurantId') restaurantId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ) {
    return this.orderService.findByRestaurant(restaurantId, page, pageSize);
  }

  @Patch('restaurants/:restaurantId/orders/:orderId/accept')
  @UseGuards(RestaurantOwnerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async acceptOrder(
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
  ) {
    await this.orderService.updateRestaurantOrderStatus(restaurantId, orderId, {
      newStatus: 'ACCEPTED',
    });
  }

  @Patch('restaurants/:restaurantId/orders/:orderId/reject')
  @UseGuards(RestaurantOwnerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async rejectOrder(
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
    @Body('reason') reason: string,
  ) {
    await this.orderService.updateRestaurantOrderStatus(restaurantId, orderId, {
      newStatus: 'CANCELLED',
      reason: reason || 'Rejected by restaurant',
    });
  }

  @Patch('restaurants/:restaurantId/orders/:orderId/status')
  @UseGuards(RestaurantOwnerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateOrderStatus(
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ) {
    await this.orderService.updateRestaurantOrderStatus(
      restaurantId,
      orderId,
      updateStatusDto,
    );
  }

  @Patch('restaurants/:restaurantId/orders/:orderId/preparing')
  @UseGuards(RestaurantOwnerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async markOrderPreparing(
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
  ) {
    await this.orderService.updateRestaurantOrderStatus(restaurantId, orderId, {
      newStatus: 'PREPARING',
    });
  }

  @Patch('restaurants/:restaurantId/orders/:orderId/ready')
  @UseGuards(RestaurantOwnerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async markOrderReady(
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
  ) {
    await this.orderService.updateRestaurantOrderStatus(restaurantId, orderId, {
      newStatus: 'READY',
    });
  }
}
