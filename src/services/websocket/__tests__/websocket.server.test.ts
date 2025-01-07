import WebSocket from 'ws';
import { WebSocketServerService } from '../websocket.server.service';
import { Logger } from '../../logger/logger.service';

describe('WebSocketServerService', () => {
    let service: WebSocketServerService;
    let mockLogger: jest.Mocked<Logger>;
    let mockSocket: jest.Mocked<WebSocket>;
    let mockRequest: any;

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
            readyState: WebSocket.OPEN,
            on: jest.fn(),
            emit: jest.fn(),
            removeAllListeners: jest.fn()
        } as any;

        mockRequest = {
            socket: {
                remoteAddress: '127.0.0.1'
            }
        };

        service = new WebSocketServerService(mockLogger);
    });

    afterEach(() => {
        service.shutdown();
    });

    it('should initialize with default config', () => {
        expect(service).toBeDefined();
    });

    it('should handle new client connection', () => {
        service['handleConnection'](mockSocket, mockRequest);
        expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('New client connected'));
    });

    it('should reject connection from non-whitelisted IP', () => {
        service['config'] = { ipWhitelist: ['192.168.1.1'] };
        service['handleConnection'](mockSocket, mockRequest);
        expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('Connection rejected'));
        expect(mockSocket.close).toHaveBeenCalled();
    });

    it('should handle client disconnection', () => {
        service['handleConnection'](mockSocket, mockRequest);
        const closeHandler = mockSocket.on.mock.calls.find(call => call[0] === 'close')[1];
        closeHandler(1000, 'Normal closure');
        expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Client disconnected'));
    });

    it('should handle WebSocket errors', () => {
        service['handleConnection'](mockSocket, mockRequest);
        const errorHandler = mockSocket.on.mock.calls.find(call => call[0] === 'error')[1];
        const error = new Error('Test error');
        errorHandler(error);
        expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('WebSocket error'), error);
    });

    it('should enforce rate limits', () => {
        service['config'] = { rateLimit: 2 };
        service['handleConnection'](mockSocket, mockRequest);
        const client = Array.from(service['clients'])[0];
        client.requestCount = 3;
        client.lastRequestTime = Date.now();

        service['handleMessage'](client, Buffer.from(JSON.stringify({ type: 'test' })));
        expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('Rate limit exceeded'));
    });

    it('should reset rate limit after cooldown', () => {
        service['config'] = { rateLimit: 2 };
        service['handleConnection'](mockSocket, mockRequest);
        const client = Array.from(service['clients'])[0];
        client.requestCount = 3;
        client.lastRequestTime = Date.now() - 61000; // 61 seconds ago

        service['handleMessage'](client, Buffer.from(JSON.stringify({ type: 'test' })));
        expect(client.requestCount).toBe(1);
        expect(mockLogger.warn).not.toHaveBeenCalled();
    });

    it('should handle market data updates', () => {
        const marketData = {
            symbol: 'BTC/USDT',
            price: 50000,
            volume: 100,
            timestamp: Date.now()
        };

        service['handleConnection'](mockSocket, mockRequest);
        const client = Array.from(service['clients'])[0];
        client.subscriptions.add('market:BTC/USDT:1m');

        service.updateMarketData('market:BTC/USDT:1m', marketData);
        expect(mockSocket.send).toHaveBeenCalledWith(expect.any(String));
    });

    it('should clean up stale market data', () => {
        const oldData = {
            symbol: 'BTC/USDT',
            timestamp: Date.now() - (25 * 60 * 60 * 1000) // 25 hours old
        };

        service['marketDataCache'].set('test', oldData);
        service['cleanupMarketDataCache']();
        expect(service['marketDataCache'].size).toBe(0);
    });

    it('should handle subscription request', () => {
        service['handleConnection'](mockSocket, mockRequest);
        const client = Array.from(service['clients'])[0];
        const subscriptionData = {
            type: 'subscribe',
            data: {
                channel: 'market',
                symbol: 'BTC/USDT',
                interval: '1m'
            }
        };

        service['handleMessage'](client, Buffer.from(JSON.stringify(subscriptionData)));
        expect(client.subscriptions.has('market:BTC/USDT:1m')).toBe(true);
        expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining('Client subscribed'));
    });

    it('should handle unsubscription request', () => {
        service['handleConnection'](mockSocket, mockRequest);
        const client = Array.from(service['clients'])[0];
        const subscriptionKey = 'market:BTC/USDT:1m';
        client.subscriptions.add(subscriptionKey);

        const unsubscribeData = {
            type: 'unsubscribe',
            data: {
                channel: 'market',
                symbol: 'BTC/USDT',
                interval: '1m'
            }
        };

        service['handleMessage'](client, Buffer.from(JSON.stringify(unsubscribeData)));
        expect(client.subscriptions.has(subscriptionKey)).toBe(false);
        expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining('Client unsubscribed'));
    });

    it('should handle successful authentication', () => {
        service['handleConnection'](mockSocket, mockRequest);
        const client = Array.from(service['clients'])[0];
        const authData = {
            type: 'auth',
            data: {
                apiKey: 'valid-key',
                signature: 'valid-signature'
            }
        };

        service['handleMessage'](client, Buffer.from(JSON.stringify(authData)));
        expect(client.authenticated).toBe(true);
        expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining('authenticated successfully'));
    });

    it('should handle failed authentication', () => {
        service['handleConnection'](mockSocket, mockRequest);
        const client = Array.from(service['clients'])[0];
        const authData = {
            type: 'auth',
            data: {
                apiKey: 'invalid-key',
                signature: 'invalid-signature'
            }
        };

        service['handleMessage'](client, Buffer.from(JSON.stringify(authData)));
        expect(client.authenticated).toBe(false);
        expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('Authentication failed'));
    });

    it('should handle invalid message format', () => {
        service['handleConnection'](mockSocket, mockRequest);
        const client = Array.from(service['clients'])[0];
        const invalidMessage = Buffer.from('invalid json');

        service['handleMessage'](client, invalidMessage);
        expect(mockLogger.error).toHaveBeenCalledWith('Error handling message:', expect.any(Error));
    });

    it('should handle unknown message type', () => {
        service['handleConnection'](mockSocket, mockRequest);
        const client = Array.from(service['clients'])[0];
        const unknownTypeData = {
            type: 'unknown',
            data: {}
        };

        service['handleMessage'](client, Buffer.from(JSON.stringify(unknownTypeData)));
        expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Unknown message type'));
    });

    it('should broadcast market data only to subscribed clients', () => {
        // İlk istemci - abone
        service['handleConnection'](mockSocket, mockRequest);
        const subscribedClient = Array.from(service['clients'])[0];
        subscribedClient.subscriptions.add('market:BTC/USDT:1m');

        // İkinci istemci - abone değil
        const mockSocket2 = { 
            ...mockSocket, 
            send: jest.fn(),
            readyState: WebSocket.OPEN,
            on: jest.fn()
        };
        service['handleConnection'](mockSocket2, mockRequest);
        const unsubscribedClient = Array.from(service['clients'])[1];

        const marketData = {
            symbol: 'BTC/USDT',
            price: 50000,
            timestamp: Date.now()
        };

        service.updateMarketData('market:BTC/USDT:1m', marketData);
        
        expect(mockSocket.send).toHaveBeenCalledWith(expect.any(String));
        expect(mockSocket2.send).not.toHaveBeenCalled();
    });

    it('should start maintenance interval on initialization', () => {
        jest.useFakeTimers();
        const envBackup = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';
        
        const newService = new WebSocketServerService(mockLogger);
        expect(newService['maintenanceInterval']).toBeDefined();
        
        process.env.NODE_ENV = envBackup;
        jest.useRealTimers();
    });

    it('should not start maintenance interval in test environment', () => {
        const envBackup = process.env.NODE_ENV;
        process.env.NODE_ENV = 'test';
        
        const newService = new WebSocketServerService(mockLogger);
        expect(newService['maintenanceInterval']).toBeNull();
        
        process.env.NODE_ENV = envBackup;
    });

    it('should clear maintenance interval on shutdown', () => {
        jest.useFakeTimers();
        const envBackup = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';
        
        const newService = new WebSocketServerService(mockLogger);
        expect(newService['maintenanceInterval']).toBeDefined();
        
        newService.shutdown();
        expect(newService['maintenanceInterval']).toBeNull();
        
        process.env.NODE_ENV = envBackup;
        jest.useRealTimers();
    });

    it('should run maintenance interval every hour', () => {
        jest.useFakeTimers();
        const envBackup = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';
        
        const newService = new WebSocketServerService(mockLogger);
        const cleanupSpy = jest.spyOn(newService as any, 'cleanupMarketDataCache');
        
        // 1 saat ilerlet
        jest.advanceTimersByTime(3600000);
        expect(cleanupSpy).toHaveBeenCalledTimes(1);
        
        // 2 saat daha ilerlet
        jest.advanceTimersByTime(7200000);
        expect(cleanupSpy).toHaveBeenCalledTimes(3);
        
        process.env.NODE_ENV = envBackup;
        jest.useRealTimers();
    });

    it('should restart maintenance interval', () => {
        jest.useFakeTimers();
        const envBackup = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';
        
        const newService = new WebSocketServerService(mockLogger);
        const oldInterval = newService['maintenanceInterval'];
        
        newService['startMaintenanceInterval']();
        const newInterval = newService['maintenanceInterval'];
        
        expect(oldInterval).not.toBe(newInterval);
        
        process.env.NODE_ENV = envBackup;
        jest.useRealTimers();
    });
}); 