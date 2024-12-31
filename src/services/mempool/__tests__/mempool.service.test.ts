import { MempoolService } from '../mempool.service';
import { RPCClient } from '../../../utils/rpc.client';
import { Logger } from '../../../utils/logger';
import { createMockLogger } from '../../../utils/test.utils';

jest.mock('../../../utils/rpc.client');
jest.mock('../../../utils/logger');

describe('MempoolService', () => {
  let mempoolService: MempoolService;
  let mockRpcClient: jest.Mocked<RPCClient>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockRpcClient = new RPCClient('url', 'user', 'pass', undefined) as jest.Mocked<RPCClient>;
    mockLogger = createMockLogger() as jest.Mocked<Logger>;
    mempoolService = new MempoolService(mockRpcClient, mockLogger);
    jest.clearAllMocks();
  });

  afterEach(() => {
    mempoolService.stopWatching();
    jest.clearAllMocks();
  });

  describe('watchMempool', () => {
    it('should start watching mempool', async () => {
      const mockCallback = jest.fn();
      const mockTransactions = [
        {
          txid: 'tx1',
          size: 1000,
          fee: 0.0001,
          time: 1234567890,
          height: 12345,
          descendantcount: 1,
          descendantsize: 1000,
          descendantfees: 0.0001,
          ancestorcount: 1,
          ancestorsize: 1000,
          ancestorfees: 0.0001
        }
      ];

      mockRpcClient.call.mockResolvedValueOnce(mockTransactions);

      await mempoolService.watchMempool(mockCallback, 1000);
      expect(mockRpcClient.call).toHaveBeenCalledWith('getrawmempool', [true]);
      expect(mockCallback).toHaveBeenCalledWith(mockTransactions);
    });

    it('should handle invalid transaction data', async () => {
      const mockCallback = jest.fn();
      mockRpcClient.call.mockRejectedValueOnce(new Error('Invalid transaction data in response'));

      await mempoolService.watchMempool(mockCallback);
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to start watching mempool: Invalid transaction data in response');
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should handle RPC error', async () => {
      const mockCallback = jest.fn();
      const error = new Error('Network error');
      mockRpcClient.call.mockRejectedValueOnce(error);

      await mempoolService.watchMempool(mockCallback);
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to start watching mempool: Network error');
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should handle interval updates', async () => {
      jest.useFakeTimers();
      const mockCallback = jest.fn();
      const mockTransactions = [
        {
          txid: 'tx1',
          size: 1000,
          fee: 0.0001,
          time: 1234567890,
          height: 12345,
          descendantcount: 1,
          descendantsize: 1000,
          descendantfees: 0.0001,
          ancestorcount: 1,
          ancestorsize: 1000,
          ancestorfees: 0.0001
        }
      ];

      mockRpcClient.call.mockResolvedValue(mockTransactions);

      await mempoolService.watchMempool(mockCallback, 1000);
      expect(mockCallback).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(1000);
      await Promise.resolve();
      await Promise.resolve();
      expect(mockCallback).toHaveBeenCalledTimes(2);

      jest.useRealTimers();
    });

    it('should handle interval update errors', async () => {
      jest.useFakeTimers();
      const mockCallback = jest.fn();
      const mockTransactions = [
        {
          txid: 'tx1',
          size: 1000,
          fee: 0.0001,
          time: 1234567890
        }
      ];

      mockRpcClient.call
        .mockResolvedValueOnce(mockTransactions)
        .mockRejectedValueOnce(new Error('Invalid transaction data in response'));

      await mempoolService.watchMempool(mockCallback, 1000);
      expect(mockCallback).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(1000);
      await Promise.resolve();
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to scan mempool: Invalid transaction data in response');

      jest.useRealTimers();
    });
  });

  describe('getTransactionStatus', () => {
    const txid = 'tx1';

    it('should get transaction status successfully', async () => {
      const mockResponse = {
        confirmed: true,
        blockHeight: 12345,
        confirmations: 10,
        timestamp: 1234567890
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      const result = await mempoolService.getTransactionStatus(txid);
      expect(result).toEqual(mockResponse);
      expect(mockRpcClient.call).toHaveBeenCalledWith('gettxstatus', [txid]);
    });

    it('should handle missing txid', async () => {
      await expect(mempoolService.getTransactionStatus(''))
        .rejects
        .toThrow('Failed to get transaction status: Transaction ID is required');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to get transaction status: Transaction ID is required');
    });

    it('should handle invalid RPC response', async () => {
      mockRpcClient.call.mockResolvedValueOnce(null);

      await expect(mempoolService.getTransactionStatus(txid))
        .rejects
        .toThrow('Failed to get transaction status: Invalid response from RPC');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to get transaction status: Invalid response from RPC');
    });

    it('should handle invalid confirmed type', async () => {
      const mockResponse = {
        confirmed: 'true',
        blockHeight: 12345,
        confirmations: 10,
        timestamp: 1234567890
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      await expect(mempoolService.getTransactionStatus(txid))
        .rejects
        .toThrow('Failed to get transaction status: Invalid response from RPC');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to get transaction status: Invalid response from RPC');
    });

    it('should handle RPC error', async () => {
      const error = new Error('Network error');
      mockRpcClient.call.mockRejectedValueOnce(error);

      await expect(mempoolService.getTransactionStatus(txid))
        .rejects
        .toThrow('Failed to get transaction status: Network error');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to get transaction status: Network error');
    });

    it('should handle unknown RPC error', async () => {
      mockRpcClient.call.mockRejectedValueOnce('Unknown error');

      await expect(mempoolService.getTransactionStatus(txid))
        .rejects
        .toThrow('Failed to get transaction status: Unknown error');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to get transaction status: Unknown error');
    });
  });

  describe('scanMempool', () => {
    it('should scan mempool successfully', async () => {
      const mockTransactions = [
        {
          txid: 'tx1',
          size: 1000,
          fee: 0.0001,
          time: 1234567890,
          height: 12345,
          descendantcount: 1,
          descendantsize: 1000,
          descendantfees: 0.0001,
          ancestorcount: 1,
          ancestorsize: 1000,
          ancestorfees: 0.0001
        }
      ];

      mockRpcClient.call.mockResolvedValueOnce(mockTransactions);

      const result = await mempoolService.scanMempool();
      expect(result).toEqual(mockTransactions);
      expect(mockRpcClient.call).toHaveBeenCalledWith('getrawmempool', [true]);
    });

    it('should handle invalid RPC response', async () => {
      mockRpcClient.call.mockResolvedValueOnce(null);

      await expect(mempoolService.scanMempool())
        .rejects
        .toThrow('Failed to scan mempool: Invalid response from RPC');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to scan mempool: Invalid response from RPC');
    });

    it('should handle non-array RPC response', async () => {
      mockRpcClient.call.mockResolvedValueOnce({});

      await expect(mempoolService.scanMempool())
        .rejects
        .toThrow('Failed to scan mempool: Invalid response from RPC');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to scan mempool: Invalid response from RPC');
    });

    it('should handle invalid transaction data - missing txid', async () => {
      const mockTransactions = [
        {
          size: 1000,
          fee: 0.0001,
          time: 1234567890
        }
      ];

      mockRpcClient.call.mockResolvedValueOnce(mockTransactions);

      await expect(mempoolService.scanMempool())
        .rejects
        .toThrow('Failed to scan mempool: Invalid transaction data in response');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to scan mempool: Invalid transaction data in response');
    });

    it('should handle invalid transaction data - invalid size type', async () => {
      const mockTransactions = [
        {
          txid: 'tx1',
          size: '1000',
          fee: 0.0001,
          time: 1234567890
        }
      ];

      mockRpcClient.call.mockResolvedValueOnce(mockTransactions);

      await expect(mempoolService.scanMempool())
        .rejects
        .toThrow('Failed to scan mempool: Invalid transaction data in response');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to scan mempool: Invalid transaction data in response');
    });

    it('should handle invalid transaction data - invalid fee type', async () => {
      const mockTransactions = [
        {
          txid: 'tx1',
          size: 1000,
          fee: '0.0001',
          time: 1234567890
        }
      ];

      mockRpcClient.call.mockResolvedValueOnce(mockTransactions);

      await expect(mempoolService.scanMempool())
        .rejects
        .toThrow('Failed to scan mempool: Invalid transaction data in response');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to scan mempool: Invalid transaction data in response');
    });

    it('should handle invalid transaction data - invalid time type', async () => {
      const mockTransactions = [
        {
          txid: 'tx1',
          size: 1000,
          fee: 0.0001,
          time: '1234567890'
        }
      ];

      mockRpcClient.call.mockResolvedValueOnce(mockTransactions);

      await expect(mempoolService.scanMempool())
        .rejects
        .toThrow('Failed to scan mempool: Invalid transaction data in response');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to scan mempool: Invalid transaction data in response');
    });

    it('should handle RPC error', async () => {
      const error = new Error('Network error');
      mockRpcClient.call.mockRejectedValueOnce(error);

      await expect(mempoolService.scanMempool())
        .rejects
        .toThrow('Failed to scan mempool: Network error');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to scan mempool: Network error');
    });

    it('should handle unknown RPC error', async () => {
      mockRpcClient.call.mockRejectedValueOnce('Unknown error');

      await expect(mempoolService.scanMempool())
        .rejects
        .toThrow('Failed to scan mempool: Unknown error');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to scan mempool: Unknown error');
    });
  });

  describe('stopWatching', () => {
    it('should stop watching mempool', async () => {
      const mockCallback = jest.fn();
      await mempoolService.watchMempool(mockCallback);
      mempoolService.stopWatching();
      expect(mockLogger.info).toHaveBeenCalledWith('Stopped watching mempool');
    });

    it('should handle multiple stop calls', () => {
      mempoolService.stopWatching();
      mempoolService.stopWatching();
      expect(mockLogger.info).toHaveBeenCalledWith('Stopped watching mempool');
    });

    it('should clear interval on stop', async () => {
      jest.useFakeTimers();
      const mockCallback = jest.fn();
      const mockTransactions = [
        {
          txid: 'tx1',
          size: 1000,
          fee: 0.0001,
          time: 1234567890
        }
      ];

      mockRpcClient.call.mockResolvedValue(mockTransactions);

      await mempoolService.watchMempool(mockCallback, 1000);
      expect(mockCallback).toHaveBeenCalledTimes(1);

      mempoolService.stopWatching();
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
      expect(mockCallback).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });
  });
}); 