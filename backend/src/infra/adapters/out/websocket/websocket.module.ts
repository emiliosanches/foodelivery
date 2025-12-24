import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { WebSocketAdapter } from './websocket.adapter';
import { WebSocketPort } from '@/application/ports/out/websocket';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '7d',
        },
      }),
    }),
  ],
  providers: [
    EventsGateway,
    WebSocketAdapter,
    {
      provide: WebSocketPort,
      useExisting: WebSocketAdapter,
    },
  ],
  exports: [WebSocketPort, EventsGateway],
})
export class WebSocketModule {}

