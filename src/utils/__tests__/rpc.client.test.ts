import { jest } from '@jest/globals';
import { RPCClient } from '../rpc.client';
import { createMockLogger } from '../test.utils';

describe('RPCClient', () => {
  let rpcClient: RPCClient;
  let mockLogger: jest.Mocked<any>;
  let mockFetch: any;

  beforeEach(() => {
    mockLogger = createMockLogger();
    rpcClient = new RPCClient('http://localhost:8332', 'user', 'pass', mockLogger);

    // Mock global fetch
    mockFetch = jest.spyOn(global, 'fetch').mockImplementation(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ result: { success: true } }),
      headers: new Headers(),
      redirected: false,
      status: 200,
      statusText: 'OK',
      type: 'basic',
      url: 'http://localhost:8332',
      clone: () => ({} as Response),
      body: null,
      bodyUsed: false,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      blob: () => Promise.resolve(new Blob()),
      formData: () => Promise.resolve(new FormData()),
      text: () => Promise.resolve('')
    } as Response));
  });

  afterEach(() => {
    mockFetch.mockRestore();
  });

  it('should make successful RPC call', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        jsonrpc: '2.0',
        id: 1,
        result: { success: true }
      }),
      headers: new Headers(),
      redirected: false,
      status: 200,
      statusText: 'OK',
      type: 'basic',
      url: 'http://localhost:8332',
      clone: () => ({} as Response),
      body: null,
      bodyUsed: false,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      blob: () => Promise.resolve(new Blob()),
      formData: () => Promise.resolve(new FormData()),
      text: () => Promise.resolve('')
    } as Response;

    mockFetch.mockResolvedValue(mockResponse);

    const result = await rpcClient.call('test', ['param1', 'param2']);

    expect(result).toEqual({ success: true });
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8332',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': expect.any(String)
        }),
        body: expect.any(String)
      })
    );
  });

  it('should handle HTTP errors', async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: new Headers(),
      redirected: false,
      type: 'error',
      url: 'http://localhost:8332',
      clone: () => ({} as Response),
      body: null,
      bodyUsed: false,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      blob: () => Promise.resolve(new Blob()),
      formData: () => Promise.resolve(new FormData()),
      text: () => Promise.resolve(''),
      json: () => Promise.resolve({})
    } as Response;

    mockFetch.mockResolvedValue(mockResponse);

    await expect(rpcClient.call('test'))
      .rejects
      .toThrow('HTTP error: 404 Not Found');
    expect(mockLogger.error).toHaveBeenCalled();
  });

  it('should handle RPC errors', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        jsonrpc: '2.0',
        id: 1,
        error: {
          code: -32601,
          message: 'Method not found'
        }
      }),
      headers: new Headers(),
      redirected: false,
      status: 200,
      statusText: 'OK',
      type: 'basic',
      url: 'http://localhost:8332',
      clone: () => ({} as Response),
      body: null,
      bodyUsed: false,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      blob: () => Promise.resolve(new Blob()),
      formData: () => Promise.resolve(new FormData()),
      text: () => Promise.resolve('')
    } as Response;

    mockFetch.mockResolvedValue(mockResponse);

    await expect(rpcClient.call('test'))
      .rejects
      .toThrow('RPC error: Method not found (code: -32601)');
    expect(mockLogger.error).toHaveBeenCalled();
  });

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    await expect(rpcClient.call('test'))
      .rejects
      .toThrow('Failed to make RPC call: Network error');
    expect(mockLogger.error).toHaveBeenCalled();
  });

  it('should handle invalid JSON response', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.reject(new Error('Invalid JSON')),
      headers: new Headers(),
      redirected: false,
      status: 200,
      statusText: 'OK',
      type: 'basic',
      url: 'http://localhost:8332',
      clone: () => ({} as Response),
      body: null,
      bodyUsed: false,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      blob: () => Promise.resolve(new Blob()),
      formData: () => Promise.resolve(new FormData()),
      text: () => Promise.resolve('')
    } as Response;

    mockFetch.mockResolvedValue(mockResponse);

    await expect(rpcClient.call('test'))
      .rejects
      .toThrow('Failed to make RPC call: Invalid JSON');
    expect(mockLogger.error).toHaveBeenCalled();
  });
}); 