import { MempoolService } from '../mempool.service';
import { RpcClient } from '../../../types/rpc.types';
import { Logger } from '../../../types/logger.types';
import { Transaction } from '../../../types/transaction.types';
import { createMockRpcClient, createMockLogger, createMockTransaction } from '../../../utils/test.utils';

describe('MempoolService', () => {
  let service: MempoolService;
  let mockRpcClient: jest.Mocked<RpcClient>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockRpcClient = createMockRpcClient();
    mockLogger = createMockLogger();
    service = new MempoolService(mockRpcClient, mockLogger);
  });

  describe('getMempool', () => {
    it('should get mempool transactions', async () => {
      const mockTransactions = [createMockTransaction(), createMockTransaction()];
      mockRpcClient.call.mockResolvedValueOnce(mockTransactions);

      const result = await service.getMempool();
      expect(result).toEqual(mockTransactions);
      expect(mockRpcClient.call).toHaveBeenCalledWith('getrawmempool', [true]);
    });

    it('should handle error when getting mempool', async () => {
      const error = new Error('Failed to get mempool');
      mockRpcClient.call.mockRejectedValueOnce(error);

      await expect(service.getMempool()).rejects.toThrow('Failed to get mempool');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to get mempool:', error);
    });
  });

  describe('addTransaction', () => {
    it('should add transaction to mempool', async () => {
      const mockTx = createMockTransaction();
      const mockTxid = 'mock-txid';
      mockRpcClient.sendTransaction.mockResolvedValueOnce(mockTxid);

      const result = await service.addTransaction(mockTx);
      expect(result).toBe(mockTxid);
      expect(mockRpcClient.sendTransaction).toHaveBeenCalledWith(mockTx);
    });

    it('should handle error when adding transaction', async () => {
      const mockTx = createMockTransaction();
      const error = new Error('Failed to add transaction');
      mockRpcClient.sendTransaction.mockRejectedValueOnce(error);

      await expect(service.addTransaction(mockTx)).rejects.toThrow('Failed to add transaction');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to add transaction to mempool:', error);
    });
  });

  describe('removeTransaction', () => {
    it('should remove transaction from mempool', async () => {
      const txid = 'mock-txid';
      mockRpcClient.call.mockResolvedValueOnce(undefined);

      await service.removeTransaction(txid);
      expect(mockRpcClient.call).toHaveBeenCalledWith('removetxfrommempool', [txid]);
    });

    it('should handle error when removing transaction', async () => {
      const txid = 'mock-txid';
      const error = new Error('Failed to remove transaction');
      mockRpcClient.call.mockRejectedValueOnce(error);

      await expect(service.removeTransaction(txid)).rejects.toThrow('Failed to remove transaction');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to remove transaction from mempool:', error);
    });
  });

  describe('getTransaction', () => {
    it('should get transaction details', async () => {
      const txid = 'mock-txid';
      const mockTx = createMockTransaction();
      mockRpcClient.getTransaction.mockResolvedValueOnce(mockTx);

      const result = await service.getTransaction(txid);
      expect(result).toEqual(mockTx);
      expect(mockRpcClient.getTransaction).toHaveBeenCalledWith(txid);
    });

    it('should handle error when getting transaction', async () => {
      const txid = 'mock-txid';
      const error = new Error('Failed to get transaction');
      mockRpcClient.getTransaction.mockRejectedValueOnce(error);

      await expect(service.getTransaction(txid)).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to get transaction:', error);
    });
  });
});
