import { WebSocketService, WebSocketConfig } from '../websocket.service';

class MockWebSocket {
  public onopen: (() => void) | null = null;
  public onclose: (() => void) | null = null;
  public onerror: ((error: any) => void) | null = null;
  public onmessage: ((event: any) => void) | null = null;
  public readyState: number = WebSocket.CONNECTING;
  public OPEN: number = WebSocket.OPEN;
  public CLOSED: number = WebSocket.CLOSED;
  public CONNECTING: number = WebSocket.CONNECTING;
  public CLOSING: number = WebSocket.CLOSING;

  constructor(public url: string) {}

  public close(): void {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) this.onclose();
  }

  public send(data: string): void {
    // Mock implementation
  }
}

describe('WebSocketService', () => {
  let service: WebSocketService;
  let mockWs: MockWebSocket;
  const config: WebSocketConfig = {
    url: 'ws://test.com',
    reconnectInterval: 1000,
    maxReconnectAttempts: 3
  };

  beforeEach(() => {
    jest.useFakeTimers();
    mockWs = new MockWebSocket(config.url);
    global.WebSocket = jest.fn(() => mockWs) as any;
    service = new WebSocketService(config);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default config values', () => {
      const serviceWithDefaultConfig = new WebSocketService({ url: 'ws://test.com' });
      expect((serviceWithDefaultConfig as any).config).toEqual({
        url: 'ws://test.com',
        reconnectInterval: 5000,
        maxReconnectAttempts: 5
      });
    });

    it('should override default config values', () => {
      expect((service as any).config).toEqual(config);
    });
  });

  describe('connection management', () => {
    it('should establish connection successfully', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      service.connect();
      mockWs.readyState = WebSocket.OPEN;
      mockWs.onopen?.();

      expect(consoleSpy).toHaveBeenCalledWith('WebSocket connected');
      expect(global.WebSocket).toHaveBeenCalledWith(config.url);
    });

    it('should handle connection errors', () => {
      const consoleSpy = jest.spyOn(console, 'error');
      const error = new Error('Connection failed');
      
      service.connect();
      mockWs.onerror?.(error);

      expect(consoleSpy).toHaveBeenCalledWith('WebSocket error:', error);
    });

    it('should attempt to reconnect on close', () => {
      const connectSpy = jest.spyOn(service as any, 'connect');
      
      service.connect();
      mockWs.onclose?.();
      
      jest.advanceTimersByTime(config.reconnectInterval);
      
      expect(connectSpy).toHaveBeenCalledTimes(2);
    });

    it('should stop reconnecting after max attempts', () => {
      const connectSpy = jest.spyOn(service as any, 'connect');
      
      service.connect();
      
      // Simulate multiple close events
      for (let i = 0; i <= config.maxReconnectAttempts; i++) {
        mockWs.onclose?.();
        jest.advanceTimersByTime(config.reconnectInterval);
      }
      
      expect(connectSpy).toHaveBeenCalledTimes(config.maxReconnectAttempts + 1);
    });

    it('should not setup event handlers if WebSocket is null', () => {
      const service = new WebSocketService(config);
      (service as any).ws = null;
      (service as any).setupEventHandlers();
      // Test passes if no error is thrown
    });

    it('should reset reconnect attempts on successful connection', () => {
      service.connect();
      (service as any).reconnectAttempts = 2;
      mockWs.onopen?.();
      expect((service as any).reconnectAttempts).toBe(0);
    });
  });

  describe('message handling', () => {
    it('should send message when connection is open', () => {
      const sendSpy = jest.spyOn(mockWs, 'send');
      const testData = { test: 'data' };
      
      service.connect();
      mockWs.readyState = WebSocket.OPEN;
      service.send(testData);

      expect(sendSpy).toHaveBeenCalledWith(JSON.stringify(testData));
    });

    it('should not send message when connection is not open', () => {
      const sendSpy = jest.spyOn(mockWs, 'send');
      const testData = { test: 'data' };
      
      service.connect();
      mockWs.readyState = WebSocket.CLOSED;
      service.send(testData);

      expect(sendSpy).not.toHaveBeenCalled();
    });

    it('should not send message when WebSocket is null', () => {
      const service = new WebSocketService(config);
      (service as any).ws = null;
      service.send({ test: 'data' });
      // Test passes if no error is thrown
    });

    it('should handle different WebSocket states', () => {
      const sendSpy = jest.spyOn(mockWs, 'send');
      const testData = { test: 'data' };
      
      service.connect();

      // Test CONNECTING state
      mockWs.readyState = WebSocket.CONNECTING;
      service.send(testData);
      expect(sendSpy).not.toHaveBeenCalled();

      // Test CLOSING state
      mockWs.readyState = WebSocket.CLOSING;
      service.send(testData);
      expect(sendSpy).not.toHaveBeenCalled();
    });
  });

  describe('close handling', () => {
    it('should close the connection properly', () => {
      const closeSpy = jest.spyOn(mockWs, 'close');
      
      service.connect();
      service.close();

      expect(closeSpy).toHaveBeenCalled();
    });

    it('should handle close event', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      service.connect();
      mockWs.onclose?.();

      expect(consoleSpy).toHaveBeenCalledWith('WebSocket closed');
    });

    it('should not throw error when closing null connection', () => {
      const service = new WebSocketService(config);
      (service as any).ws = null;
      service.close();
      // Test passes if no error is thrown
    });

    it('should trigger reconnect on close', () => {
      const handleReconnectSpy = jest.spyOn(service as any, 'handleReconnect');
      
      service.connect();
      mockWs.onclose?.();

      expect(handleReconnectSpy).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle initial connection error', () => {
      const consoleSpy = jest.spyOn(console, 'error');
      const error = new Error('Initial connection failed');
      
      (global.WebSocket as jest.Mock).mockImplementationOnce(() => {
        throw error;
      });
      
      service.connect();

      expect(consoleSpy).toHaveBeenCalledWith('WebSocket connection error:', error);
    });

    it('should handle runtime errors', () => {
      const consoleSpy = jest.spyOn(console, 'error');
      const error = new Error('Runtime error');
      
      service.connect();
      mockWs.onerror?.(error);

      expect(consoleSpy).toHaveBeenCalledWith('WebSocket error:', error);
    });

    it('should handle reconnect after connection error', () => {
      const handleReconnectSpy = jest.spyOn(service as any, 'handleReconnect');
      const error = new Error('Connection failed');
      
      (global.WebSocket as jest.Mock).mockImplementationOnce(() => {
        throw error;
      });
      
      service.connect();

      expect(handleReconnectSpy).toHaveBeenCalled();
    });

    it('should handle multiple errors without exceeding max reconnect attempts', () => {
      const connectSpy = jest.spyOn(service as any, 'connect');
      const error = new Error('Connection failed');
      
      // Simulate multiple connection errors
      for (let i = 0; i <= config.maxReconnectAttempts + 1; i++) {
        (global.WebSocket as jest.Mock).mockImplementationOnce(() => {
          throw error;
        });
        service.connect();
        jest.advanceTimersByTime(config.reconnectInterval);
      }
      
      expect(connectSpy).toHaveBeenCalledTimes(config.maxReconnectAttempts + 1);
    });
  });

  describe('reconnection logic', () => {
    it('should use default max reconnect attempts if not provided', () => {
      const serviceWithoutMax = new WebSocketService({ url: 'ws://test.com' });
      const connectSpy = jest.spyOn(serviceWithoutMax as any, 'connect');
      
      serviceWithoutMax.connect();
      
      // Simulate multiple close events
      for (let i = 0; i <= 5; i++) {
        mockWs.onclose?.();
        jest.advanceTimersByTime(5000); // Default reconnect interval
      }
      
      expect(connectSpy).toHaveBeenCalledTimes(6); // Initial + 5 attempts
    });

    it('should handle reconnect timing correctly', () => {
      const connectSpy = jest.spyOn(service as any, 'connect');
      
      service.connect();
      mockWs.onclose?.();
      
      // Check that reconnect hasn't happened immediately
      expect(connectSpy).toHaveBeenCalledTimes(1);
      
      // Advance time by half the interval
      jest.advanceTimersByTime(config.reconnectInterval / 2);
      expect(connectSpy).toHaveBeenCalledTimes(1);
      
      // Advance to full interval
      jest.advanceTimersByTime(config.reconnectInterval / 2);
      expect(connectSpy).toHaveBeenCalledTimes(2);
    });
  });
}); 