export interface WebSocketMessage {
  event: string;
  data: any;
}

export abstract class WebSocketPort {
  /**
   * Emit message to a specific user
   */
  abstract emitToUser(userId: string, message: WebSocketMessage): void;

  /**
   * Emit message to a specific room
   */
  abstract emitToRoom(room: string, message: WebSocketMessage): void;

  /**
   * Emit message to all connected clients
   */
  abstract emitToAll(message: WebSocketMessage): void;
}

