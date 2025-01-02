import { WebSocket, WebSocketServer } from 'ws';
import { Logger } from '../logger/logger.service';
import { EventEmitter } from 'events';
import { createHash, randomBytes } from 'crypto';
import { OrderUpdate } from '../../types/market.types';
import { TradeUpdate } from '../../types/trade.types';
import { LiquidationEvent } from '../../types/liquidation.types';
import { MarketState } from '../../types/market-state.types';
import { PositionUpdate, FundingRateUpdate } from '../../types/futures.types';
import { AccountUpdate, AccountPosition } from '../../types/account.types';
import { TickerUpdate, MiniTicker, MarketStatistics } from '../../types/ticker.types';
import { MonitoringService } from '../monitoring/monitoring.service';
import { MetricType } from '../../types/monitoring.types';

export interface WebSocketConfig {
  port: number;
  host: string;
  maxConnections: number;
  rateLimit?: {
    maxRequestsPerMinute: number;
    maxConnectionsPerIP: number;
  };
  security?: {
    enableIPWhitelist: boolean;
    whitelistedIPs?: string[];
    requireAuthentication: boolean;
  };
}

export interface WebSocketClient {
  id: string;
  socket: WebSocket;
  subscriptions: Set<string>;
  ip: string;
  authenticated: boolean;
  requestCount: number;
  lastRequestTime: number;
}

export interface SubscriptionData {
  channel: string;
  symbols: string[];
  interval?: string;
  depth?: number;
}

export class WebSocketService extends EventEmitter {
  private wss!: WebSocketServer;
  private clients: Map<string, WebSocketClient>;
  private readonly logger: Logger;
  private ipConnections: Map<string, number>;
  private marketDataCache: Map<string, any>;
  private lastCleanupTime: number;
  private readonly monitoringService: MonitoringService;

  constructor(
    private readonly config: WebSocketConfig,
    logger: Logger
  ) {
    super();
    this.logger = logger;
    this.monitoringService = new MonitoringService(logger);
    this.clients = new Map();
    this.ipConnections = new Map();
    this.marketDataCache = new Map();
    this.lastCleanupTime = Date.now();
    this.initializeServer();
  }

  private initializeServer(): void {
    this.wss = new WebSocketServer({
      port: this.config.port,
      host: this.config.host,
      verifyClient: this.verifyClient.bind(this),
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    this.startMaintenanceInterval();

    this.logger.info(`WebSocket server started on ${this.config.host}:${this.config.port}`);
  }

  private verifyClient(info: { origin: string; secure: boolean; req: any }): boolean {
    const ip = info.req.socket.remoteAddress;

    if (this.config.security?.enableIPWhitelist) {
      if (!this.config.security.whitelistedIPs?.includes(ip)) {
        this.logger.warn(`Connection attempt from non-whitelisted IP: ${ip}`);
        return false;
      }
    }

    const currentConnections = this.ipConnections.get(ip) || 0;
    if (currentConnections >= (this.config.rateLimit?.maxConnectionsPerIP || 50)) {
      this.logger.warn(`Too many connections from IP: ${ip}`);
      return false;
    }

    return true;
  }

  private handleConnection(socket: WebSocket, request: any): void {
    const clientId = this.generateClientId();
    const ip = request.socket.remoteAddress;

    const client: WebSocketClient = {
      id: clientId,
      socket,
      subscriptions: new Set(),
      ip,
      authenticated: false,
      requestCount: 0,
      lastRequestTime: Date.now(),
    };

    this.clients.set(clientId, client);
    this.ipConnections.set(ip, (this.ipConnections.get(ip) || 0) + 1);

    socket.on('message', (data: Buffer) => this.handleMessage(client, data));
    socket.on('close', () => this.handleDisconnection(clientId));
    socket.on('error', error => this.handleError(client, error));

    this.logger.debug(`Client connected: ${clientId} from IP: ${ip}`);

    const metrics = this.monitoringService.getWebSocketMetrics();
    this.monitoringService.updateWebSocketMetrics({
      activeConnections: this.clients.size,
      peakConnections: Math.max(metrics.peakConnections, this.clients.size),
    });
  }

  private async handleMessage(client: WebSocketClient, data: Buffer): Promise<void> {
    const startTime = Date.now();
    try {
      if (!this.checkRateLimit(client)) {
        return;
      }

      const message = JSON.parse(data.toString());

      if (message.type === 'auth') {
        await this.handleAuth(client, message);
        return;
      }

      if (this.config.security?.requireAuthentication && !client.authenticated) {
        this.sendError(client, 'Authentication required');
        return;
      }

      if (message.type === 'subscribe') {
        await this.handleSubscription(client, message.data);
        return;
      }

      this.emit('message', { client, message });

      this.monitoringService.updateWebSocketMetrics({
        messageCount: this.monitoringService.getWebSocketMetrics().messageCount + 1,
        latency: Date.now() - startTime,
      });
    } catch (error) {
      this.handleError(client, error as Error);
    }
  }

  private checkRateLimit(client: WebSocketClient): boolean {
    const now = Date.now();
    client.requestCount++;

    if (now - client.lastRequestTime >= 60000) {
      client.requestCount = 1;
      client.lastRequestTime = now;
      return true;
    }

    if (client.requestCount > (this.config.rateLimit?.maxRequestsPerMinute || 1000)) {
      this.sendError(client, 'Rate limit exceeded');
      return false;
    }

    return true;
  }

  private async handleAuth(client: WebSocketClient, message: any): Promise<void> {
    try {
      // Implement your authentication logic here
      const isValid = await this.validateAuth(message.apiKey, message.signature, message.timestamp);

      if (isValid) {
        client.authenticated = true;
        this.sendTo(client.id, 'auth', { status: 'success' });
      } else {
        this.sendError(client, 'Authentication failed');
      }
    } catch (error) {
      this.sendError(client, 'Authentication error');
    }
  }

  private async validateAuth(
    apiKey: string,
    signature: string,
    timestamp: number
  ): Promise<boolean> {
    if (!apiKey || !signature || !timestamp) {
      return false;
    }

    // Check timestamp is within 5 seconds
    const now = Date.now();
    if (Math.abs(now - timestamp) > 5000) {
      return false;
    }

    try {
      // Implement your signature validation logic here
      // Example: HMAC validation
      const message = `${apiKey}${timestamp}`;
      const expectedSignature = createHash('sha256').update(message).digest('hex');

      return signature === expectedSignature;
    } catch (error) {
      this.logger.error('Auth validation error:', error);
      return false;
    }
  }

  private async handleSubscription(client: WebSocketClient, data: SubscriptionData): Promise<void> {
    try {
      // Validate subscription request
      if (!this.validateSubscription(data)) {
        this.sendError(client, 'Invalid subscription parameters');
        return;
      }

      client.subscriptions.add(this.getSubscriptionKey(data));

      // Send initial state from cache if available
      const cachedData = this.marketDataCache.get(this.getSubscriptionKey(data));
      if (cachedData) {
        this.sendTo(client.id, 'snapshot', cachedData);
      }

      this.logger.debug(`Client ${client.id} subscribed to ${data.channel}`);
    } catch (error) {
      this.sendError(client, 'Subscription failed');
    }
  }

  private validateSubscription(data: SubscriptionData): boolean {
    if (!data.channel || !data.symbols || !Array.isArray(data.symbols)) {
      return false;
    }

    const validChannels = ['orderbook', 'trade', 'liquidation', 'market'];
    if (!validChannels.some(c => data.channel.startsWith(c))) {
      return false;
    }

    if (data.interval && !['1m', '5m', '15m', '30m', '1h', '4h', '1d'].includes(data.interval)) {
      return false;
    }

    if (data.depth && (data.depth < 1 || data.depth > 1000)) {
      return false;
    }

    return true;
  }

  private getSubscriptionKey(data: SubscriptionData): string {
    return `${data.channel}:${data.symbols.join(',')}:${data.interval || ''}:${data.depth || ''}`;
  }

  private startMaintenanceInterval(): void {
    setInterval(() => {
      this.cleanupStaleConnections();
      this.cleanupMarketDataCache();
    }, 60000); // Run every minute
  }

  private cleanupStaleConnections(): void {
    const now = Date.now();
    this.clients.forEach((client, id) => {
      if (now - client.lastRequestTime > 300000) {
        // 5 minutes
        this.handleDisconnection(id);
      }
    });
  }

  private cleanupMarketDataCache(): void {
    const now = Date.now();
    if (now - this.lastCleanupTime > 3600000) {
      // 1 hour
      this.marketDataCache.clear();
      this.lastCleanupTime = now;
    }
  }

  private sendError(client: WebSocketClient, message: string): void {
    this.sendTo(client.id, 'error', { message });
  }

  public updateMarketData(channel: string, data: any): void {
    this.marketDataCache.set(channel, data);
    this.broadcast(channel, data);
  }

  private handleDisconnection(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      this.clients.delete(clientId);
      this.logger.debug(`Client disconnected: ${clientId}`);
    }
  }

  public broadcast(event: string, data: any): void {
    const message = JSON.stringify({ event, data });
    this.clients.forEach(client => {
      if (client.socket.readyState === WebSocket.OPEN) {
        client.socket.send(message);
      }
    });
  }

  public sendTo(clientId: string, event: string, data: any): boolean {
    const client = this.clients.get(clientId);
    if (client && client.socket.readyState === WebSocket.OPEN) {
      client.socket.send(JSON.stringify({ event, data }));
      return true;
    }
    return false;
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public getConnectedClients(): number {
    return this.clients.size;
  }

  public shutdown(): void {
    this.wss.close(() => {
      this.logger.info('WebSocket server shut down');
    });
  }

  public updateOrderBook(symbol: string, data: OrderUpdate): void {
    const channel = `orderbook:${symbol}`;
    this.marketDataCache.set(channel, data);
    this.broadcast(channel, {
      type: 'orderbook',
      data,
    });
  }

  public updateTrade(symbol: string, data: TradeUpdate): void {
    const channel = `trade:${symbol}`;
    this.marketDataCache.set(channel, data);
    this.broadcast(channel, {
      type: 'trade',
      data,
    });
  }

  public updateLiquidation(symbol: string, data: LiquidationEvent): void {
    const channel = `liquidation:${symbol}`;
    this.marketDataCache.set(channel, data);
    this.broadcast(channel, {
      type: 'liquidation',
      data,
    });
  }

  public updateMarketState(symbol: string, data: MarketState): void {
    const channel = `market:${symbol}`;
    this.marketDataCache.set(channel, data);
    this.broadcast(channel, {
      type: 'market_state',
      data,
    });
  }

  private handleError(client: WebSocketClient, error: Error): void {
    this.logger.error(`WebSocket error for client ${client.id}:`, error);
    this.sendError(client, 'Internal server error');
    this.monitoringService.updateWebSocketMetrics({
      errorCount: this.monitoringService.getWebSocketMetrics().errorCount + 1,
    });
  }

  public updatePosition(symbol: string, data: PositionUpdate): void {
    const channel = `position:${symbol}`;
    this.marketDataCache.set(channel, data);
    this.broadcast(channel, {
      type: 'position',
      data,
    });
    this.monitoringService.recordMetric({
      name: 'position_update',
      type: MetricType.COUNTER,
      value: 1,
      timestamp: Date.now(),
    });
  }

  public updateFundingRate(symbol: string, data: FundingRateUpdate): void {
    const channel = `funding:${symbol}`;
    this.marketDataCache.set(channel, data);
    this.broadcast(channel, {
      type: 'funding',
      data,
    });
  }

  public updateAccount(accountId: string, data: AccountUpdate): void {
    const channel = `account:${accountId}`;
    this.marketDataCache.set(channel, data);
    this.broadcast(channel, {
      type: 'account',
      data,
    });
  }

  public updateAccountPosition(accountId: string, data: AccountPosition): void {
    const channel = `account_position:${accountId}`;
    this.marketDataCache.set(channel, data);
    this.broadcast(channel, {
      type: 'account_position',
      data,
    });
  }

  public updateTicker(symbol: string, data: TickerUpdate): void {
    const channel = `ticker:${symbol}`;
    this.marketDataCache.set(channel, data);
    this.broadcast(channel, {
      type: 'ticker',
      data,
    });
  }

  public updateMiniTicker(symbol: string, data: MiniTicker): void {
    const channel = `miniTicker:${symbol}`;
    this.marketDataCache.set(channel, data);
    this.broadcast(channel, {
      type: 'miniTicker',
      data,
    });
  }

  public updateStatistics(symbol: string, data: MarketStatistics): void {
    const channel = `statistics:${symbol}`;
    this.marketDataCache.set(channel, data);
    this.broadcast(channel, {
      type: 'statistics',
      data,
    });
  }

  public getMetrics() {
    return this.monitoringService.getWebSocketMetrics();
  }

  public getHealth() {
    return this.monitoringService.getSystemHealth();
  }
}
