import WebSocket from 'ws';
import { WebSocketService } from '../websocket.service';
import { Logger } from '../../logger/logger.service';

describe('WebSocketService', () => {
  let service: WebSocketService;
  let mockLogger: jest.Mocked<Logger>;
  let mockSocket: jest.Mocked<WebSocket>;
  let mockClient: any;
  let mockRequest: any;
  let mockWs: any;
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    originalEnv = process.env;
    process.env.NODE_ENV = 'test';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    } as any;

    mockSocket = {
      send: jest.fn(),
      close: jest.fn(),
      readyState: WebSocket.OPEN
    } as any;

    mockClient = {
      socket: mockSocket,
      subscriptions: new Set(),
      authenticated: false,
      requestCount: 0,
      lastRequestTime: Date.now()
    };

    mockRequest = {
      socket: {
        remoteAddress: '127.0.0.1'
      }
    };

    mockWs = {
      ...mockSocket,
      on: jest.fn(),
      once: jest.fn(),
      removeAllListeners: jest.fn()
    };

    service = new WebSocketService(mockLogger);
    service['clients'] = new Set([mockClient]);
  });

  afterEach(() => {
    service.shutdown();
  });

  describe('Connection Management', () => {
    it('should handle rate limiting', () => {
      const mockConfig = { rateLimit: 10 };
      service['config'] = mockConfig;
      service['rateLimitExceeded'] = true;
      
      service['handleMessage'](mockClient, Buffer.from(JSON.stringify({ type: 'subscribe' })));
      
      expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('Rate limit exceeded'));
    });

    it('should handle IP whitelist', () => {
      const mockConfig = { ipWhitelist: ['127.0.0.1'] };
      service['config'] = mockConfig;
      mockRequest.socket.remoteAddress = '192.168.1.1';
      
      service['handleConnection'](mockWs, mockRequest);
      
      expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('Connection rejected'));
    });

    it('should handle invalid message format', () => {
      const invalidMessage = Buffer.from('invalid json');
      
      service['handleMessage'](mockClient, invalidMessage);
      
      expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Error handling message'), expect.any(Error));
    });

    it('should handle unknown message type', () => {
      const unknownMessage = {
        type: 'unknown',
        data: {}
      };
      
      service['handleMessage'](mockClient, Buffer.from(JSON.stringify(unknownMessage)));
      
      expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Unknown message type'));
    });

    it('should handle connection with no IP address', () => {
      mockRequest.socket.remoteAddress = '';
      
      service['handleConnection'](mockWs, mockRequest);
      
      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('New client connected'));
    });
  });

  describe('Subscription Management', () => {
    it('should handle market data subscription', async () => {
      const subscribeMessage = {
        type: 'subscribe',
        data: { channel: 'market', symbol: 'BTC/USDT', interval: '1m' }
      };
      
      await service['handleMessage'](mockClient, Buffer.from(JSON.stringify(subscribeMessage)));
      
      const subscriptionKey = service['getSubscriptionKey'](subscribeMessage.data);
      expect(mockClient.subscriptions.has(subscriptionKey)).toBeTruthy();
      expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining('subscribed to'));
    });

    it('should handle market data unsubscription', async () => {
      const unsubscribeMessage = {
        type: 'unsubscribe',
        data: { channel: 'market', symbol: 'BTC/USDT', interval: '1m' }
      };
      
      const subscriptionKey = service['getSubscriptionKey'](unsubscribeMessage.data);
      mockClient.subscriptions.add(subscriptionKey);
      
      await service['handleMessage'](mockClient, Buffer.from(JSON.stringify(unsubscribeMessage)));
      
      expect(mockClient.subscriptions.has(subscriptionKey)).toBeFalsy();
      expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining('unsubscribed from'));
    });
  });

  describe('Market Updates', () => {
    it('should broadcast market updates to subscribed clients', () => {
      const marketUpdate = {
        type: 'market',
        symbol: 'BTC/USDT',
        open: 50000,
        high: 51000,
        low: 49000,
        close: 50500,
        volume: 1000,
        timestamp: Date.now()
      };

      service.updateMarketData('market:BTC/USDT:1m', marketUpdate);
      
      const expectedMessage = JSON.stringify({
        type: 'market',
        event: 'market:BTC/USDT:1m',
        data: marketUpdate
      });
      expect(mockSocket.send).toHaveBeenCalledWith(expectedMessage);
    });
  });

  describe('Error Handling', () => {
    it('should handle unknown message types', async () => {
      const unknownMessage = { type: 'unknown' };
      
      await service['handleMessage'](mockClient, Buffer.from(JSON.stringify(unknownMessage)));
      
      expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Unknown message type'));
    });
  });

  describe('Authentication', () => {
    it('should handle authentication requests', async () => {
      const authMessage = {
        type: 'auth',
        data: { apiKey: 'valid-key', signature: 'valid-signature' }
      };
      
      await service['handleMessage'](mockClient, Buffer.from(JSON.stringify(authMessage)));
      
      expect(mockClient.authenticated).toBeTruthy();
      expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining('authenticated'));
    });

    it('should reject invalid authentication', async () => {
      const invalidAuthMessage = {
        type: 'auth',
        data: { apiKey: 'invalid-key', signature: 'invalid-signature' }
      };
      
      await service['handleMessage'](mockClient, Buffer.from(JSON.stringify(invalidAuthMessage)));
      
      expect(mockClient.authenticated).toBeFalsy();
      expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('Authentication failed'));
    });
  });

  describe('Cache Management', () => {
    let mockNow: number;

    beforeEach(() => {
      mockNow = 1735773054334;
      jest.spyOn(Date, 'now').mockReturnValue(mockNow);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should handle market data caching', () => {
      const marketData = {
        symbol: 'BTC/USDT',
        open: 50000,
        high: 51000,
        low: 49000,
        close: 50500,
        volume: 1000,
        timestamp: mockNow
      };

      const cacheKey = 'market:BTC/USDT:1m';
      service['marketDataCache'].set(cacheKey, marketData);
      const cachedData = service['marketDataCache'].get(cacheKey);
      
      expect(cachedData).toEqual(marketData);
    });

    it('should clean up stale market data', () => {
      const oldData = {
        symbol: 'BTC/USDT',
        open: 50000,
        high: 51000,
        low: 49000,
        close: 50500,
        volume: 1000,
        timestamp: mockNow - (25 * 60 * 60 * 1000) // 25 hours old
      };

      const cacheKey = 'market:BTC/USDT:1m';
      service['marketDataCache'].set(cacheKey, oldData);
      
      // Advance time by 1 hour
      jest.spyOn(Date, 'now').mockReturnValue(mockNow + (1 * 60 * 60 * 1000));
      
      service['cleanupMarketDataCache']();
      const cachedData = service['marketDataCache'].get(cacheKey);
      
      expect(cachedData).toBeUndefined();
    });
  });

  describe('Maintenance', () => {
    let mockNow: number;

    beforeEach(() => {
      mockNow = 1735773054334;
      jest.spyOn(Date, 'now').mockReturnValue(mockNow);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should restart maintenance interval', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      const setIntervalSpy = jest.spyOn(global, 'setInterval');
      
      service['maintenanceInterval'] = setInterval(() => {}, 1000);
      service['startMaintenanceInterval']();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 3600000);
    });

    it('should clean up stale market data', () => {
      const oldData = {
        symbol: 'BTC/USDT',
        open: 50000,
        high: 51000,
        low: 49000,
        close: 50500,
        volume: 1000,
        timestamp: mockNow - (25 * 60 * 60 * 1000) // 25 hours old
      };

      const freshData = {
        ...oldData,
        timestamp: mockNow - (23 * 60 * 60 * 1000) // 23 hours old
      };

      const oldKey = 'market:BTC/USDT:1m:old';
      const freshKey = 'market:BTC/USDT:1m:fresh';
      
      service['marketDataCache'].set(oldKey, oldData);
      service['marketDataCache'].set(freshKey, freshData);
      
      service['cleanupMarketDataCache']();
      
      expect(service['marketDataCache'].get(oldKey)).toBeUndefined();
      expect(service['marketDataCache'].get(freshKey)).toEqual(freshData);
    });

    it('should handle empty market data cache', () => {
      service['marketDataCache'].clear();
      service['cleanupMarketDataCache']();
      expect(service['marketDataCache'].size).toBe(0);
    });

    it('should handle all stale market data', () => {
      const staleData1 = {
        symbol: 'BTC/USDT',
        timestamp: mockNow - (25 * 60 * 60 * 1000)
      };
      const staleData2 = {
        symbol: 'ETH/USDT',
        timestamp: mockNow - (26 * 60 * 60 * 1000)
      };

      service['marketDataCache'].set('key1', staleData1);
      service['marketDataCache'].set('key2', staleData2);

      service['cleanupMarketDataCache']();

      expect(service['marketDataCache'].size).toBe(0);
    });
  });
});
