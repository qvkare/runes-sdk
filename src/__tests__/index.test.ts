import { RunesSDK } from '../index';
import { createMockLogger, createMockRPCClient } from '../utils/test.utils';
import { LogLevel } from '../utils/logger';
import { BatchTransfer } from '../types/rune.types';
import { RPCClient } from '../utils/rpc.client';

jest.mock('../utils/rpc.client');

describe('RunesSDK', () => {
  let sdk: RunesSDK;
  let mockLogger: any;
  let mockRpcClientInstance: any;

  beforeEach(() => {
    mockLogger = createMockLogger();
    mockRpcClientInstance = createMockRPCClient();
    mockRpcClientInstance.call.mockImplementation(async (method: string) => {
      switch (method) {
        case 'gettransactionhistory':
          return [
            {
              txid: 'tx1',
              type: 'transfer',
              from: 'addr1',
              to: 'addr2',
              amount: '100',
              timestamp: 1234567890,
            },
          ];
        case 'gettransaction':
          return {
            txid: 'tx1',
            type: 'transfer',
            from: 'addr1',
            to: 'addr2',
            amount: '100',
            timestamp: 1234567890,
          };
        case 'transfer':
          return { txid: 'tx123' };
        default:
          return {};
      }
    });

    sdk = new RunesSDK('http://localhost:8332', 'testuser', 'testpass', mockLogger);

    // @ts-expect-error Intentionally overriding private property for testing
    sdk['rpcClient'] = mockRpcClientInstance;

    // Mock RPC responses
    mockRpcClientInstance.call.mockImplementation((method: string, _params: string[]) => {
      if (method === 'gettransactionhistory') {
        return Promise.resolve([{ txid: 'tx1' /* other required fields */ }]);
      }
      if (method === 'gettransaction') {
        return Promise.resolve({ txid: 'testTxId' /* other required fields */ });
      }
      return Promise.reject(new Error('Unknown method'));
    });

    // Reset mock
    (RPCClient as jest.Mock).mockImplementation(() => mockRpcClientInstance);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize successfully', () => {
    expect(sdk).toBeDefined();
  });

  it('should handle invalid configuration', () => {
    expect(() => new RunesSDK('', '', '', mockLogger)).toThrow();
  });

  it('should handle custom logger level', () => {
    const customLogger = createMockLogger();
    customLogger.level = LogLevel.DEBUG;

    const customSdk = new RunesSDK('http://localhost:8332', 'testuser', 'testpass', customLogger);

    expect(customSdk).toBeDefined();
  });

  describe('getTransactionHistory', () => {
    it('should get transaction history successfully', async () => {
      const result = await sdk.getTransactionHistory('testAddress');
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].txid).toBe('tx1');
    });

    it('should get transaction history with limit', async () => {
      const result = await sdk.getTransactionHistory('testAddress', 10);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].txid).toBe('tx1');
    });

    it('should get transaction history with limit and offset', async () => {
      const result = await sdk.getTransactionHistory('testAddress', 10, 20);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].txid).toBe('tx1');
    });
  });

  describe('getTransaction', () => {
    it('should get transaction successfully', async () => {
      const result = await sdk.getTransaction('testTxId');
      expect(result).toBeDefined();
      expect(result.txid).toBe('testTxId');
    });
  });

  describe('processBatch', () => {
    it('should process batch successfully', async () => {
      const transfers: BatchTransfer[] = [
        {
          from: 'addr1',
          to: 'addr2',
          amount: '100',
          symbol: 'RUNE',
        },
      ];

      const result = await sdk.processBatch(transfers);
      expect(result).toBeDefined();
      expect(result.successful).toBeDefined();
      expect(result.failed).toBeDefined();
      expect(result.totalTransfers).toBeDefined();
      expect(result.successfulTransfers).toBeDefined();
      expect(result.failedTransfers).toBeDefined();
      expect(result.errors).toBeDefined();
    });
  });
});
