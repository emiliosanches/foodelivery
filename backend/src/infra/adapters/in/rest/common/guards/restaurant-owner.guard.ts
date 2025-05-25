import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { RestaurantRepositoryPort } from '@/application/ports/out/repositories/restaurant.repository.port';

@Injectable()
export class RestaurantOwnerGuard implements CanActivate {
  constructor(
    private readonly restaurantRepository: RestaurantRepositoryPort,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const restaurantId = request.params.restaurantId;

    if (user.isAdmin) return true;

    if (!user || !restaurantId) {
      throw new ForbiddenException('Access denied');
    }

    const restaurant = await this.restaurantRepository.findById(restaurantId);

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    if (restaurant.userId !== user.id) {
      throw new ForbiddenException(
        'You are not authorized to access this restaurant',
      );
    }

    request.restaurant = restaurant;

    return true;
  }
}
