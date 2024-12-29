import { RPCClient } from '../rpc.client';
import { Logger } from '../logger';
import { createMockLogger } from './test.utils';

describe('RPCClient', () => {
  let mockLogger: jest.Mocked<Logger>;
  let mockFetch: jest.Mock;
  let originalFetch: typeof global.fetch;
  let client: RPCClient;

  beforeEach(() => {
    mockLogger = createMockLogger('RPCClient');
    mockFetch = jest.fn();
    originalFetch = global.fetch;
    global.fetch = mockFetch;
    client = new RPCClient('http://localhost:8332', { 
      logger: mockLogger,
      timeout: 100,
      maxRetries: 2,
      retryDelay: 10
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    global.fetch = originalFetch;
    jest.useRealTimers();
  });

  describe('constructor', () => {
    it('should create instance with default values', (): void => {
      const client = new RPCClient('http://localhost:8332', { logger: mockLogger });
      expect(client.baseUrl).toBe('http://localhost:8332');
      expect(client['logger']).toBe(mockLogger);
    });

    it('should create instance with custom values', (): void => {
      const client = new RPCClient(
        'http://localhost:8332',
        {
          logger: mockLogger,
          timeout: 1000,
          maxRetries: 5,
          retryDelay: 2000
        }
      );
      expect(client.baseUrl).toBe('http://localhost:8332');
      expect(client['logger']).toBe(mockLogger);
    });

    it('should use default values when not provided', (): void => {
      const client = new RPCClient('http://localhost:8332', { logger: mockLogger });
      expect(client.baseUrl).toBe('http://localhost:8332');
      expect(client['timeout']).toBe(5000);
      expect(client['maxRetries']).toBe(3);
      expect(client['retryDelay']).toBe(1000);
    });

    it('should use provided values', (): void => {
      const client = new RPCClient(
        'http://localhost:8332',
        {
          logger: mockLogger,
          timeout: 10000,
          maxRetries: 5,
          retryDelay: 2000
        }
      );
      expect(client.baseUrl).toBe('http://localhost:8332');
      expect(client['timeout']).toBe(10000);
      expect(client['maxRetries']).toBe(5);
      expect(client['retryDelay']).toBe(2000);
    });
  });

  describe('call', () => {
    it('should retry on failure and succeed', async (): Promise<void> => {
      const error = new Error('Network error');
      mockFetch
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ result: 'success' })
        });

      const result = await client.call('test');
      expect(result).toEqual({ result: 'success' });
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockLogger.warn).toHaveBeenCalledTimes(1);
    });

    it('should handle RPC error response', async (): Promise<void> => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          error: { message: 'RPC error message' }
        })
      };
      mockFetch.mockImplementation(() => Promise.resolve(mockResponse));

      await expect(client.call('test')).rejects.toThrow('RPC error message');
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should handle network error with custom message', async (): Promise<void> => {
      const error = new Error('Custom network error');
      mockFetch.mockImplementation(() => Promise.reject(error));

      await expect(client.call('test')).rejects.toThrow('Network error: Custom network error');
    });

    it('should handle unknown error type', async (): Promise<void> => {
      mockFetch.mockImplementation(() => Promise.reject('Unknown error type'));

      await expect(client.call('test')).rejects.toThrow('Network error: Unknown error');
    });

    it('should handle timeout', async (): Promise<void> => {
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';
      mockFetch.mockImplementation(() => Promise.reject(abortError));

      await expect(client.call('test')).rejects.toThrow('Request timed out');
    });

    it('should handle empty params array', async (): Promise<void> => {
      mockFetch.mockImplementation(() => Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ result: 'success' })
      }));

      await client.call('test');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8332',
        expect.objectContaining({
          body: expect.stringContaining('"params":[]')
        })
      );
    });

    it('should include request ID in payload', async (): Promise<void> => {
      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now);

      mockFetch.mockImplementation(() => Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ result: 'success' })
      }));

      await client.call('test');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8332',
        expect.objectContaining({
          body: expect.stringContaining(`"id":${now}`)
        })
      );

      jest.restoreAllMocks();
    });

    it('should handle JSON parse error', async (): Promise<void> => {
      mockFetch.mockImplementation(() => Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.reject(new Error('Invalid JSON'))
      }));

      await expect(client.call('test')).rejects.toThrow('Invalid JSON response');
    });

    it('should exhaust all retries and throw last error', async (): Promise<void> => {
      const error = new Error('Persistent error');
      mockFetch
        .mockImplementationOnce(() => Promise.reject(error))
        .mockImplementationOnce(() => Promise.reject(error));

      await expect(client.call('test')).rejects.toThrow('Network error: Persistent error');
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockLogger.warn).toHaveBeenCalledTimes(1);
    });

    it('should handle undefined error response', async (): Promise<void> => {
      mockFetch.mockImplementation(() => Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          error: undefined,
          result: 'success'
        })
      }));

      const result = await client.call('test');
      expect(result).toEqual({
        error: undefined,
        result: 'success'
      });
    });

    it('should handle HTTP error', async (): Promise<void> => {
      mockFetch.mockImplementation(() => Promise.resolve({
        ok: false,
        status: 500
      }));

      await expect(client.call('test')).rejects.toThrow('HTTP error! status: 500');
    });

    it('should handle no response', async (): Promise<void> => {
      mockFetch.mockImplementation(() => Promise.resolve(undefined));

      await expect(client.call('test')).rejects.toThrow('No response received');
    });
  });
}); 