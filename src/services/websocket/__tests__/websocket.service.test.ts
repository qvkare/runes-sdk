import { WebSocket } from 'ws';
import { WebSocketService, WebSocketConfig, WebSocketClient } from '../websocket.service';
import { Logger } from '../../logger/logger.service';
import { OrderUpdate, OrderSide, OrderType, OrderStatus } from '../../../types/market.types';
import { TradeUpdate } from '../../../types/trade.types';
import { LiquidationEvent, LiquidationType } from '../../../types/liquidation.types';
import { MarketState, MarketStatus } from '../../../types/market-state.types';
import { PositionUpdate, MarginType, PositionSide } from '../../../types/futures.types';
import { AccountUpdate, BalanceUpdate } from '../../../types/account.types';
import { TickerUpdate } from '../../../types/ticker.types';
import { MonitoringService } from '../../monitoring/monitoring.service';

jest.mock('ws');
jest.mock('../../logger/logger.service');
jest.mock('../../monitoring/monitoring.service', () => {
  return {
    MonitoringService: jest.fn().mockImplementation(() => ({
      getWebSocketMetrics: jest.fn().mockReturnValue({
        messageCount: 1,
        errorCount: 0,
        reconnectCount: 0,
        latency: 0,
        messageRate: 0,
        bandwidthUsage: 0,
        activeConnections: 0,
        peakConnections: 0,
        lastCleanupTime: Date.now(),
        cacheSize: 0,
        uptime: 0,
        lastHeartbeat: Date.now(),
        memoryUsage: {
          heapTotal: 0,
          heapUsed: 0,
          external: 0,
          rss: 0,
        },
      }),
      updateWebSocketMetrics: jest.fn(),
      recordMetric: jest.fn(),
      getSystemHealth: jest.fn().mockReturnValue({
        status: 'healthy',
        components: {
          websocket: { status: 'healthy' },
          cache: { status: 'healthy' },
        },
      }),
    })),
  };
});

describe('WebSocketService', () => {
  let service: WebSocketService;
  let mockLogger: jest.Mocked<Logger>;
  let mockSocket: any;
  let mockClient: WebSocketClient;

  const mockConfig: WebSocketConfig = {
    port: 8080,
    host: 'localhost',
    maxConnections: 100,
    rateLimit: {
      maxRequestsPerMinute: 1000,
      maxConnectionsPerIP: 50,
    },
    security: {
      enableIPWhitelist: true,
      whitelistedIPs: ['127.0.0.1'],
      requireAuthentication: true,
    },
  };

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    } as any;

    mockSocket = {
      send: jest.fn(),
      on: jest.fn(),
      close: jest.fn(),
      ping: jest.fn(),
      pong: jest.fn(),
      terminate: jest.fn(),
      readyState: WebSocket.OPEN,
    };

    mockClient = {
      id: 'test',
      socket: mockSocket,
      subscriptions: new Set<string>(),
      ip: '127.0.0.1',
      authenticated: false,
      requestCount: 0,
      lastRequestTime: Date.now(),
    };

    service = new WebSocketService(mockConfig, mockLogger);
    service['clients'].set(mockClient.id, mockClient);
  });

  afterEach(() => {
    service.shutdown();
    jest.clearAllMocks();
  });

  it('should handle invalid messages gracefully', () => {
    service['handleMessage'](mockClient, Buffer.from('invalid json'));

    expect(mockLogger.error).toHaveBeenCalledWith(
      'WebSocket error for client test:',
      expect.any(Error)
    );
  });

  describe('Market Data Updates', () => {
    it('should handle position updates', () => {
      const positionUpdate: PositionUpdate = {
        symbol: 'BTC/USDT',
        positionSide: PositionSide.LONG,
        marginType: MarginType.ISOLATED,
        leverage: 10,
        entryPrice: 50000,
        markPrice: 51000,
        unrealizedPnL: 1000,
        liquidationPrice: 45000,
        marginRatio: 0.1,
        maintenanceMargin: 500,
        marginBalance: 5000,
        timestamp: Date.now(),
        notional: 50000,
        isAutoAddMargin: false,
      };

      service.updatePosition('BTC/USDT', positionUpdate);

      expect(mockSocket.send).toHaveBeenCalledWith(expect.stringContaining('"type":"position"'));
    });

    it('should handle funding rate updates', () => {
      const fundingUpdate = {
        symbol: 'BTC/USDT',
        markPrice: 50000,
        indexPrice: 50100,
        estimatedSettlePrice: 50050,
        lastFundingRate: 0.0001,
        nextFundingTime: Date.now() + 3600000,
        interestRate: 0.0002,
        timestamp: Date.now(),
      };

      service.updateFundingRate('BTC/USDT', fundingUpdate);

      expect(mockSocket.send).toHaveBeenCalledWith(expect.stringContaining('"type":"funding"'));
    });

    it('should handle account updates', () => {
      const accountUpdate: AccountUpdate = {
        makerCommission: 0.001,
        takerCommission: 0.002,
        buyerCommission: 0.001,
        sellerCommission: 0.001,
        canTrade: true,
        canWithdraw: true,
        canDeposit: true,
        updateTime: Date.now(),
        accountType: 'SPOT',
        balances: [],
        permissions: ['SPOT', 'MARGIN'],
      };

      service.updateAccount('user123', accountUpdate);

      expect(mockSocket.send).toHaveBeenCalledWith(expect.stringContaining('"type":"account"'));
    });

    it('should handle ticker updates', () => {
      const tickerUpdate: TickerUpdate = {
        symbol: 'BTC/USDT',
        priceChange: 1000,
        priceChangePercent: 2,
        weightedAvgPrice: 50500,
        lastPrice: 51000,
        lastQty: 1,
        openPrice: 50000,
        highPrice: 51500,
        lowPrice: 49500,
        volume: 1000,
        quoteVolume: 50500000,
        openTime: Date.now() - 86400000,
        closeTime: Date.now(),
        firstId: 1,
        lastId: 1000,
        count: 1000,
      };

      service.updateTicker('BTC/USDT', tickerUpdate);

      expect(mockSocket.send).toHaveBeenCalledWith(expect.stringContaining('"type":"ticker"'));
    });
  });

  describe('Monitoring & Health', () => {
    it('should provide metrics', () => {
      const metrics = service.getMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.messageCount).toBeDefined();
      expect(metrics.errorCount).toBeDefined();
    });

    it('should provide health status', () => {
      const health = service.getHealth();
      expect(health).toBeDefined();
      expect(health.status).toBeDefined();
      expect(health.components).toBeDefined();
    });

    it('should update metrics on message handling', async () => {
      await service['handleMessage'](mockClient, Buffer.from(JSON.stringify({ type: 'ping' })));

      const metrics = service.getMetrics();
      expect(metrics.messageCount).toBeDefined();
    });
  });
});
