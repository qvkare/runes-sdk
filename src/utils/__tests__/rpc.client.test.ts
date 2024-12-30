import { jest } from '@jest/globals';
import { RPCClient, RPCClientConfig } from '../rpc.client';
import { Logger } from '../logger';
import { createMockLogger } from './test.utils';

describe('RPCClient', () => {
  let client: RPCClient;
  let mockFetch: jest.Mock;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockLogger = createMockLogger();

    mockFetch = jest.fn();
    global.fetch = mockFetch;

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
    global.fetch = undefined as any;
  });

  it('should make successful RPC call', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ result: 'success' }),
    } as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    const result = await client.call('test', []);
    expect(result).toBe('success');
  });

  it('should handle HTTP error', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
    } as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    await expect(client.call('test', [])).rejects.toThrow('HTTP error 500');
  });

  it('should handle RPC error', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ error: { message: 'RPC error' } }),
    } as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    await expect(client.call('test', [])).rejects.toThrow('RPC error');
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

    const result = await client.call('test', []);
    expect(result).toBe('success');
  });

  it('should handle network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(client.call('test', [])).rejects.toThrow('Network error');
  });
});
