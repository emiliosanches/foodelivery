import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { DeliveryPersonServicePort } from '@/application/ports/in/services/delivery-person.service.port';

@Injectable()
export class DeliveryPersonGuard implements CanActivate {
  constructor(
    @Inject(DeliveryPersonServicePort)
    private readonly deliveryPersonService: DeliveryPersonServicePort,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new NotFoundException('User not authenticated');
    }

    const deliveryPerson = await this.deliveryPersonService.findByUserId(
      user.id,
    );

    if (!deliveryPerson) {
      throw new NotFoundException(
        'Delivery profile not found. Please create your profile first.',
      );
    }

    request.deliveryPerson = deliveryPerson;

    return true;
  }
}
