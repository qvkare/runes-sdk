import { RPCClient } from '../rpc.client';
import { RPCError, RPCTimeoutError, RPCRetryError, RPCResponseError } from '../errors';
import { BitcoinConfig } from '../../config/bitcoin.config';

describe('RPCClient', () => {
  let client: RPCClient;
  const mockConfig: BitcoinConfig = {
    rpcUrl: 'http://localhost:8332',
    network: 'regtest',
    username: 'test',
    password: 'test'
  };

  beforeEach(() => {
    client = new RPCClient(mockConfig, {
      timeout: 100,
      maxRetries: 2,
      retryDelay: 10
    });
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const client = new RPCClient(mockConfig);
      expect(client).toBeInstanceOf(RPCClient);
    });

    it('should initialize with custom options', () => {
      const client = new RPCClient(mockConfig, {
        timeout: 5000,
        maxRetries: 2,
        retryDelay: 500
      });
      expect(client).toBeInstanceOf(RPCClient);
    });
  });

  describe('call', () => {
    it('should make successful RPC call', async () => {
      const mockResponse = { result: 'success' };
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ jsonrpc: '2.0', id: 1, result: mockResponse })
      });

      const result = await client.call('test');
      expect(result).toEqual(mockResponse);
    });

    it('should handle RPC errors', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          error: { code: -32601, message: 'Method not found' }
        })
      });

      await expect(client.call('invalid')).rejects.toThrow(RPCError);
    });

    it('should handle HTTP errors', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({})
      });

      await expect(client.call('test')).rejects.toThrow('HTTP error! status: 404');
    });

    it('should handle timeouts', async () => {
      const mockAbort = jest.fn();
      const mockController = { abort: mockAbort, signal: { aborted: false } };
      global.AbortController = jest.fn(() => mockController);
      global.fetch = jest.fn().mockImplementationOnce(() => {
        mockAbort();
        const error = new Error('AbortError');
        error.name = 'AbortError';
        throw error;
      });

      await expect(client.call('test')).rejects.toThrow(RPCTimeoutError);
      expect(mockAbort).toHaveBeenCalled();
    });

    it('should handle invalid JSON responses', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ jsonrpc: '2.0', id: 1 }) // Missing result and error
      });

      await expect(client.call('test')).rejects.toThrow(RPCResponseError);
    });

    it('should retry on specific errors', async () => {
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            jsonrpc: '2.0',
            id: 1,
            error: { code: -28, message: 'Loading block index' }
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ jsonrpc: '2.0', id: 2, result: 'success' })
        });

      const result = await client.call('test');
      expect(result).toBe('success');
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should throw after max retries', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          error: { code: -28, message: 'Loading block index' }
        })
      });

      await expect(client.call('test')).rejects.toThrow(RPCRetryError);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle network errors', async () => {
      global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'));

      await expect(client.call('test')).rejects.toThrow('Network error');
    });

    it('should handle JSON parse errors', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error('Invalid JSON'); }
      });

      await expect(client.call('test')).rejects.toThrow('Invalid JSON');
    });

    it('should handle warmup errors', async () => {
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            jsonrpc: '2.0',
            id: 1,
            error: { code: -8, message: 'Server in warmup' }
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            jsonrpc: '2.0',
            id: 2,
            result: 'success'
          })
        });

      const result = await client.call('test');
      expect(result).toBe('success');
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
}); 