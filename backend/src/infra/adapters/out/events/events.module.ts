import { Global, Module } from '@nestjs/common';
import { NotificationsModule } from '../../in/rest/modules/notifications/notifications.module';
import { OrderEventHandler } from '@/application/event-handlers/order.event-handler';
import { OrdersEventBusPort } from '@/application/ports/out/event-bus';
import { OrdersEventBusAdapter } from './orders.event-bus.adapter';
import { WebSocketModule } from '../websocket/websocket.module';

@Global()
@Module({
  imports: [NotificationsModule, WebSocketModule],
  providers: [
    { provide: OrdersEventBusPort, useClass: OrdersEventBusAdapter },
    OrderEventHandler,
  ],
  exports: [OrdersEventBusPort],
})
export class EventsModule {}
