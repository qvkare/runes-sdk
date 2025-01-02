import { WebSocketService, WebSocketConfig } from './services/websocket/websocket.service';
import { Logger } from './services/logger/logger.service';

export interface SDKConfig {
  host: string;
  username: string;
  password: string;
  websocket?: WebSocketConfig;
}

export class RunesSDK {
  private readonly logger: Logger;
  private webSocketService: WebSocketService | null = null;

  constructor(private readonly config: SDKConfig) {
    this.logger = new Logger();
    this.initialize();
  }

  private initialize(): void {
    if (this.config.websocket) {
      this.webSocketService = new WebSocketService(this.config.websocket, this.logger);
    }
  }

  public getWebSocketService(): WebSocketService | null {
    return this.webSocketService;
  }

  public shutdown(): void {
    if (this.webSocketService) {
      this.webSocketService.shutdown();
    }
  }
}
