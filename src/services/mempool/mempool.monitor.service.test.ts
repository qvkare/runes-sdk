import { jest } from '@jest/globals';
import { MempoolMonitorService } from './mempool.monitor.service';
import { createMockRpcClient, createMockLogger } from '../../utils/test.utils';
import { RpcClient } from '../../types/rpc.types';
import { Logger } from '../../types/logger.types';

describe('MempoolMonitorService', () => {
  let monitorService: MempoolMonitorService;
  let mockRpcClient: jest.Mocked<RpcClient>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockRpcClient = createMockRpcClient();
    mockLogger = createMockLogger();
    monitorService = new MempoolMonitorService(mockRpcClient, mockLogger);
  });

  describe('watchTransaction', () => {
    it('should watch a transaction successfully', async () => {
      const txid = 'mock-txid';

      await monitorService.watchTransaction(txid);

      expect(mockRpcClient.getTransaction).toHaveBeenCalledWith(txid);
      expect(mockLogger.info).toHaveBeenCalledWith(`Transaction ${txid} found in mempool`);
    });

    it('should handle transaction not found error', async () => {
      const txid = 'mock-txid';
      const error = new Error('Transaction not found');

      mockRpcClient.getTransaction.mockRejectedValueOnce(error);

      await expect(monitorService.watchTransaction(txid)).rejects.toThrow('Transaction not found');
      expect(mockLogger.error).toHaveBeenCalledWith(`Error watching transaction ${txid}:`, error);
    });
  });

  describe('stopWatchingTransaction', () => {
    it('should stop watching a transaction successfully', async () => {
      const txid = 'mock-txid';

      await monitorService.stopWatchingTransaction(txid);

      expect(mockRpcClient.stopWatchingTransaction).toHaveBeenCalledWith(txid);
      expect(mockLogger.info).toHaveBeenCalledWith(`Stopped watching transaction ${txid}`);
    });

    it('should handle stop watching error', async () => {
      const txid = 'mock-txid';
      const error = new Error('Failed to stop watching');

      mockRpcClient.stopWatchingTransaction.mockRejectedValueOnce(error);

      await expect(monitorService.stopWatchingTransaction(txid)).rejects.toThrow(
        'Failed to stop watching'
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        `Error stopping watch on transaction ${txid}:`,
        error
      );
    });
  });
});
