import { jest } from '@jest/globals';
import { RPCClient } from '../utils/rpc.client';
import { Logger } from '../utils/logger';
import { RPCClientConfig } from '../types';

describe('RPCClient', () => {
  let client: RPCClient;
  let mockLogger: jest.Mocked<Logger>;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
    } as jest.Mocked<Logger>;

    mockFetch = jest.fn() as jest.Mock;
    global.fetch = mockFetch as unknown as typeof fetch;

    const config: RPCClientConfig = {
      host: 'localhost',
      port: 8332,
      username: 'user',
      password: 'pass',
      maxRetries: 3,
      logger: mockLogger,
    };

    client = new RPCClient(config);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('call', () => {
    it('should make successful RPC call', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ result: 'success' }),
      } as Response;

      mockFetch.mockResolvedValueOnce(mockResponse);

      const result = await client.call('getblockcount');
      expect(result).toBe('success');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should handle HTTP error', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
      } as Response;

      mockFetch.mockResolvedValueOnce(mockResponse);

      await expect(client.call('getblockcount')).rejects.toThrow('HTTP error 500');
    });

    it('should handle RPC error', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ error: { message: 'RPC error' } }),
      } as Response;

      mockFetch.mockResolvedValueOnce(mockResponse);

      await expect(client.call('getblockcount')).rejects.toThrow('RPC error');
    });

    it('should retry on failure', async () => {
      const mockErrorResponse = {
        ok: false,
        status: 500,
      } as Response;

      const mockSuccessResponse = {
        ok: true,
        json: () => Promise.resolve({ result: 'success' }),
      } as Response;

      mockFetch.mockResolvedValueOnce(mockErrorResponse).mockResolvedValueOnce(mockSuccessResponse);

      const result = await client.call('getblockcount');
      expect(result).toBe('success');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(client.call('getblockcount')).rejects.toThrow('Network error');
    });
  });
});
