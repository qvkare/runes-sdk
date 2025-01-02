import { jest } from '@jest/globals';
import { MempoolMonitorService } from '../mempool.monitor.service';
import { RpcClient } from '../../../types/rpc.types';
import { Logger } from '../../../types/logger.types';
import { createMockRpcClient, createMockLogger } from '../../../utils/test.utils';

describe('MempoolMonitorService', () => {
  let service: MempoolMonitorService;
  let mockRpcClient: jest.Mocked<RpcClient>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockRpcClient = createMockRpcClient();
    mockLogger = createMockLogger();
    service = new MempoolMonitorService(mockRpcClient, mockLogger);
  });

  describe('watchTransaction', () => {
    it('should monitor transaction successfully', async () => {
      const txid = 'test-txid';
      mockRpcClient.watchTransaction.mockResolvedValueOnce();

      await service.watchTransaction(txid);
      expect(mockRpcClient.watchTransaction).toHaveBeenCalledWith(txid);
      expect(mockLogger.info).toHaveBeenCalledWith('Transaction found in mempool:', txid);
    });

    it('should handle monitoring error', async () => {
      const txid = 'test-txid';
      const error = new Error('Monitoring failed');
      mockRpcClient.watchTransaction.mockRejectedValueOnce(error);

      await expect(service.watchTransaction(txid)).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to watch transaction:', txid, error);
    });
  });

  describe('stopWatchingTransaction', () => {
    it('should stop monitoring transaction successfully', async () => {
      const txid = 'test-txid';
      mockRpcClient.stopWatchingTransaction.mockResolvedValueOnce();

      await service.stopWatchingTransaction(txid);
      expect(mockRpcClient.stopWatchingTransaction).toHaveBeenCalledWith(txid);
      expect(mockLogger.info).toHaveBeenCalledWith('Stopped watching transaction:', txid);
    });

    it('should handle stop monitoring error', async () => {
      const txid = 'test-txid';
      const error = new Error('Stop monitoring failed');
      mockRpcClient.stopWatchingTransaction.mockRejectedValueOnce(error);

      await expect(service.stopWatchingTransaction(txid)).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to stop watching transaction:',
        txid,
        error
      );
    });
  });
});
