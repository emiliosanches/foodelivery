import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { OrderRepositoryPort } from '@/application/ports/out/repositories/order.repository.port';
import { User } from '@/domain/entities/user.entity';
import { OrderWithPartsDto } from '@/application/dtos/order';

@Injectable()
export class OrderAccessGuard implements CanActivate {
  constructor(private readonly orderRepository: OrderRepositoryPort) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const orderId = request.params.id;

    if (user.isAdmin) return true;

    if (!user || !orderId) throw new ForbiddenException('Access denied');

    const order = await this.orderRepository.findByIdWithParts(orderId);

    if (!order) throw new NotFoundException('Order not found');

    const hasAccess = this.checkOrderAccess(user, order);

    if (!hasAccess)
      throw new ForbiddenException(
        'You are not authorized to access this order',
      );

    return true;
  }

  private checkOrderAccess(user: User, order: OrderWithPartsDto): boolean {
    if (order.customerId === user.id) return true;

    if (order.restaurant.userId === user.id) return true;

    if (order.delivery?.deliveryPersonId === user.id) return true;

    return false;
  }
}
