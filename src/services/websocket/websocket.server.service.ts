import WebSocket from 'ws';
import { IncomingMessage } from 'http';
import { Logger } from '../logger/logger.service';

export interface WebSocketServerConfig {
  port?: number;
  host?: string;
  ipWhitelist?: string[];
  rateLimit?: number;
}

export interface WebSocketClient {
  socket: WebSocket;
  subscriptions: Set<string>;
  authenticated: boolean;
  requestCount: number;
  lastRequestTime: number;
}

export class WebSocketServerService {
    private clients: Set<WebSocketClient>;
    private server: WebSocket.Server | null;
    private config: WebSocketServerConfig;
    private marketDataCache: Map<string, any>;
    private maintenanceInterval: NodeJS.Timeout | null;

    constructor(private logger: Logger) {
        this.clients = new Set();
        this.marketDataCache = new Map();
        this.server = null;
        this.maintenanceInterval = null;
        this.config = {};
        
        // Don't start the interval in Jest test environment
        if (process.env.NODE_ENV !== 'test') {
            this.startMaintenanceInterval();
        }
    }

    private startMaintenanceInterval(): void {
        if (this.maintenanceInterval) {
            clearInterval(this.maintenanceInterval);
        }
        this.maintenanceInterval = setInterval(() => {
            this.cleanupMarketDataCache();
        }, 3600000); // Run every hour
    }

    private cleanupMarketDataCache(): void {
        const now = Date.now();
        for (const [key, data] of this.marketDataCache.entries()) {
            if (now - data.timestamp > 24 * 60 * 60 * 1000) { // 24 hours
                this.marketDataCache.delete(key);
            }
        }
    }

    public shutdown(): void {
        if (this.maintenanceInterval) {
            clearInterval(this.maintenanceInterval);
            this.maintenanceInterval = null;
        }
        if (this.server) {
            this.server.close();
            this.server = null;
        }
        this.clients.clear();
        this.marketDataCache.clear();
    }

    private handleMessage(client: WebSocketClient, message: Buffer): void {
        try {
            // Rate limit kontrolü
            if (this.config.rateLimit) {
                const now = Date.now();
                const timeDiff = now - client.lastRequestTime;
                
                if (timeDiff > 60000) { // 1 dakika geçtiyse sıfırla
                    client.requestCount = 0;
                    client.lastRequestTime = now;
                }
                
                if (client.requestCount >= this.config.rateLimit) {
                    this.logger.warn('Rate limit exceeded for client');
                    return;
                }
                
                client.requestCount++;
                client.lastRequestTime = now;
            }

            const data = JSON.parse(message.toString());

            switch (data.type) {
                case 'subscribe':
                    this.handleSubscription(client, data.data);
                    break;
                case 'unsubscribe':
                    this.handleUnsubscription(client, data.data);
                    break;
                case 'auth':
                    this.handleAuthentication(client, data.data);
                    break;
                default:
                    this.logger.error('Unknown message type received');
                    break;
            }
        } catch (error) {
            this.logger.error('Error handling message:', error as Error);
        }
    }

    private handleSubscription(client: WebSocketClient, data: any): void {
        const subscriptionKey = this.getSubscriptionKey(data);
        client.subscriptions.add(subscriptionKey);
        this.logger.debug(`Client subscribed to ${subscriptionKey}`);
    }

    private handleUnsubscription(client: WebSocketClient, data: any): void {
        const subscriptionKey = this.getSubscriptionKey(data);
        client.subscriptions.delete(subscriptionKey);
        this.logger.debug(`Client unsubscribed from ${subscriptionKey}`);
    }

    private handleAuthentication(client: WebSocketClient, data: any): void {
        const { apiKey, signature } = data;
        if (this.validateAuthentication(apiKey, signature)) {
            client.authenticated = true;
            this.logger.debug('Client authenticated successfully');
        } else {
            this.logger.warn('Authentication failed for client');
        }
    }

    private validateAuthentication(apiKey: string, signature: string): boolean {
        // Implement actual authentication validation logic
        return apiKey === 'valid-key' && signature === 'valid-signature';
    }

    private getSubscriptionKey(data: any): string {
        return `${data.channel}:${data.symbol}:${data.interval}`;
    }

    public updateMarketData(channel: string, data: any): void {
        const message = {
            type: 'market',
            event: channel,
            data
        };

        this.broadcast(JSON.stringify(message));
    }

    private broadcast(message: string): void {
        const parsedMessage = JSON.parse(message);
        const eventKey = parsedMessage.event;

        for (const client of this.clients) {
            if (client.socket.readyState === WebSocket.OPEN) {
                // Eğer event bir market verisi ise ve istemci abone değilse, gönderme
                if (eventKey && eventKey.startsWith('market:') && !client.subscriptions.has(eventKey)) {
                    continue;
                }
                client.socket.send(message);
            }
        }
    }

    public handleConnection(ws: WebSocket, req: IncomingMessage): void {
        const clientIP = req.socket.remoteAddress || '';
        
        if (this.config?.ipWhitelist?.length && !this.config.ipWhitelist.includes(clientIP)) {
            this.logger.warn('Connection rejected: IP not whitelisted');
            ws.close();
            return;
        }

        const client: WebSocketClient = {
            socket: ws,
            subscriptions: new Set(),
            authenticated: false,
            requestCount: 0,
            lastRequestTime: Date.now()
        };

        this.clients.add(client);
        this.logger.info('New client connected');

        ws.on('message', (message: Buffer) => {
            this.handleMessage(client, message);
        });

        ws.on('error', (error: Error) => {
            this.logger.error('WebSocket error:', error);
        });

        ws.on('close', (code: number, reason: string) => {
            this.clients.delete(client);
            this.logger.info(`Client disconnected: ${code} - ${reason}`);
        });
    }
} 