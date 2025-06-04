import { OrdersEventBusPort } from '@/application/ports/out/event-bus';
import { OrderCreatedEvent, OrderStatusUpdatedEvent } from '@/domain/events';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class OrdersEventBusAdapter extends OrdersEventBusPort {
  constructor(private readonly eventEmitter: EventEmitter2) {
    super();
  }

  async emitOrderCreated(event: OrderCreatedEvent): Promise<void> {
    await this.eventEmitter.emitAsync(OrderCreatedEvent.event, event);
  }

  async emitOrderStatusUpdated(event: OrderStatusUpdatedEvent): Promise<void> {
    await this.eventEmitter.emitAsync(OrderStatusUpdatedEvent.event, event);
  }
}

