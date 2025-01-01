import { RPCClient } from '../rpc.client';
import { createMockLogger } from '../test.utils';

describe('RPCClient', () => {
  let rpcClient: RPCClient;
  let mockLogger: ReturnType<typeof createMockLogger>;
  const mockUrl = 'http://localhost:8332';
  const mockUsername = 'testuser';
  const mockPassword = 'testpass';

  beforeEach(() => {
    mockLogger = createMockLogger();
    rpcClient = new RPCClient(mockUrl, mockUsername, mockPassword, mockLogger);
  });

  it('should create RPC client with correct configuration', () => {
    expect(rpcClient).toBeDefined();
  });

  it('should call RPC method with correct parameters', async () => {
    const mockResponse = { result: 'test' };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await rpcClient.call('test', ['param1', 'param2']);
    expect(result).toBe(mockResponse);

    expect(fetch).toHaveBeenCalledWith(mockUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: expect.any(String),
      },
      body: expect.stringContaining('"method":"test"'),
    });
  });

  it('should handle RPC errors', async () => {
    const mockError = { error: { code: -1, message: 'Test error' } };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockError),
    });

    await expect(rpcClient.call('test')).rejects.toThrow('RPC Error: Test error (code: -1)');
  });

  it('should handle network errors', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
    await expect(rpcClient.call('test')).rejects.toThrow('Network error');
  });

  it('should get raw transaction', async () => {
    const mockTx = { result: { hex: 'test' } };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTx),
    });

    const result = await rpcClient.getRawTransaction('txid');
    expect(result).toBe(mockTx);
  });

  it('should send raw transaction', async () => {
    const mockTxId = { result: 'txid123' };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTxId),
    });

    const result = await rpcClient.sendRawTransaction('rawtx');
    expect(result).toBe('txid123');
  });

  it('should get block count', async () => {
    const mockCount = { result: 100 };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCount),
    });

    const result = await rpcClient.getBlockCount();
    expect(result).toBe(100);
  });

  it('should get block hash', async () => {
    const mockHash = { result: 'hash123' };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockHash),
    });

    const result = await rpcClient.getBlockHash(100);
    expect(result).toBe('hash123');
  });

  it('should get block', async () => {
    const mockBlock = { result: { height: 100 } };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockBlock),
    });

    const result = await rpcClient.getBlock('hash123');
    expect(result).toBe(mockBlock);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
