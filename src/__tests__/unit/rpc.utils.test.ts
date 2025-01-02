import { RpcUtils } from '../../utils/rpc.utils';
import { Transaction, TransactionType } from '../../types/transaction.types';

describe('RpcUtils', () => {
  let rpcUtils: RpcUtils;
  const mockUrl = 'http://localhost:8332';
  const mockUsername = 'user';
  const mockPassword = 'pass';

  beforeEach(() => {
    rpcUtils = new RpcUtils(mockUrl, mockUsername, mockPassword);
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with correct properties', () => {
      expect(rpcUtils.url).toBe(mockUrl);
      expect(rpcUtils.username).toBe(mockUsername);
      expect(rpcUtils.password).toBe(mockPassword);
    });
  });

  describe('call', () => {
    it('should make successful RPC call', async () => {
      const mockResponse = { ok: true, json: () => Promise.resolve({ result: 'success' }) };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await rpcUtils.call('testmethod', ['param1']);
      expect(result).toBe('success');
      expect(global.fetch).toHaveBeenCalledWith(mockUrl, expect.any(Object));
    });

    it('should handle RPC call failure', async () => {
      const mockResponse = { ok: false, statusText: 'Failed' };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(rpcUtils.call('testmethod')).rejects.toThrow('RPC call failed: Failed');
    });

    it('should handle RPC error response', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ error: { message: 'RPC Error' } }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(rpcUtils.call('testmethod')).rejects.toThrow('RPC error: RPC Error');
    });
  });

  describe('getTransaction', () => {
    it('should get transaction details', async () => {
      const mockTx: Transaction = {
        id: '123',
        type: TransactionType.TRANSFER,
        txid: '123',
        blockHash: 'hash123',
        blockHeight: 100,
        amount: '1.0',
        fee: '0.1',
        confirmations: 1,
        timestamp: Date.now(),
        sender: 'sender123',
        recipient: 'recipient123',
        size: 1000,
        time: Date.now(),
        version: 1,
        status: 'confirmed',
      };
      const mockResponse = { ok: true, json: () => Promise.resolve({ result: mockTx }) };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await rpcUtils.getTransaction('123');
      expect(result).toEqual(mockTx);
    });
  });

  describe('getBalance', () => {
    it('should get balance for address', async () => {
      const mockResponse = { ok: true, json: () => Promise.resolve({ result: 100 }) };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await rpcUtils.getBalance('address123');
      expect(result).toBe('100');
    });
  });

  describe('sendTransaction', () => {
    it('should send transaction', async () => {
      const mockTxId = 'tx123';
      const mockResponse = { ok: true, json: () => Promise.resolve({ result: mockTxId }) };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const mockTx: Transaction = {
        id: mockTxId,
        type: TransactionType.TRANSFER,
        txid: mockTxId,
        blockHash: '',
        blockHeight: 0,
        amount: '1.0',
        fee: '0.1',
        confirmations: 0,
        timestamp: Date.now(),
        sender: 'sender123',
        recipient: 'recipient123',
        size: 1000,
        time: Date.now(),
        version: 1,
        status: 'pending',
      };
      const result = await rpcUtils.sendTransaction(mockTx);
      expect(result).toBe(mockTxId);
    });
  });

  describe('validateTransaction', () => {
    it('should validate transaction successfully', async () => {
      const mockTx: Transaction = {
        id: '123',
        type: TransactionType.TRANSFER,
        txid: '123',
        blockHash: 'hash123',
        blockHeight: 100,
        amount: '1.0',
        fee: '0.1',
        confirmations: 1,
        timestamp: Date.now(),
        sender: 'sender123',
        recipient: 'recipient123',
        size: 1000,
        time: Date.now(),
        version: 1,
        status: 'confirmed',
      };
      const mockResponse = { ok: true, json: () => Promise.resolve({ result: true }) };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await rpcUtils.validateTransaction('123');
      expect(result).toBe(true);
    });

    it('should handle validation failure', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error());

      const result = await rpcUtils.validateTransaction('123');
      expect(result).toBe(false);
    });
  });

  describe('watchTransaction and stopWatchingTransaction', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should watch and stop watching transaction', async () => {
      const mockTx: Transaction = {
        id: '123',
        type: TransactionType.TRANSFER,
        txid: '123',
        blockHash: 'hash123',
        blockHeight: 100,
        amount: '1.0',
        fee: '0.1',
        confirmations: 6,
        timestamp: Date.now(),
        sender: 'sender123',
        recipient: 'recipient123',
        size: 1000,
        time: Date.now(),
        version: 1,
        status: 'confirmed',
      };
      const mockResponse = { ok: true, json: () => Promise.resolve({ result: mockTx }) };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await rpcUtils.watchTransaction('123');
      expect(rpcUtils['activeWatchers'].has('123')).toBe(true);

      jest.advanceTimersByTime(10000);

      await rpcUtils.stopWatchingTransaction('123');
      expect(rpcUtils['activeWatchers'].has('123')).toBe(false);
    });

    it('should not create duplicate watchers for the same transaction', async () => {
      const mockTx: Transaction = {
        id: '123',
        type: TransactionType.TRANSFER,
        txid: '123',
        blockHash: 'hash123',
        blockHeight: 100,
        amount: '1.0',
        fee: '0.1',
        confirmations: 6,
        timestamp: Date.now(),
        sender: 'sender123',
        recipient: 'recipient123',
        size: 1000,
        time: Date.now(),
        version: 1,
        status: 'confirmed',
      };
      const mockResponse = { ok: true, json: () => Promise.resolve({ result: mockTx }) };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await rpcUtils.watchTransaction('123');
      const firstWatcher = rpcUtils['activeWatchers'].get('123');

      await rpcUtils.watchTransaction('123');
      const secondWatcher = rpcUtils['activeWatchers'].get('123');

      expect(firstWatcher).toBe(secondWatcher);
      expect(rpcUtils['activeWatchers'].size).toBe(1);
    });
  });
});
