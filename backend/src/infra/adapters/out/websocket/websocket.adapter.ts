import {
  WebSocketPort,
  WebSocketMessage,
} from '@/application/ports/out/websocket';
import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class WebSocketAdapter extends WebSocketPort {
  private server: Server;

  setServer(server: Server) {
    this.server = server;
  }

  emitToUser(userId: string, message: WebSocketMessage): void {
    if (!this.server) {
      console.warn('WebSocket server not initialized');
      return;
    }
    this.server.to(`user:${userId}`).emit(message.event, message.data);
  }

  emitToRoom(room: string, message: WebSocketMessage): void {
    if (!this.server) {
      console.warn('WebSocket server not initialized');
      return;
    }
    this.server.to(room).emit(message.event, message.data);
  }

  emitToAll(message: WebSocketMessage): void {
    if (!this.server) {
      console.warn('WebSocket server not initialized');
      return;
    }
    this.server.emit(message.event, message.data);
  }
}

