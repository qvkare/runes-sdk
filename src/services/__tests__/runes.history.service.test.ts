import { createMockLogger, createMockRpcClient } from '../../utils/test.utils';
import { RunesHistoryService } from '../runes.history.service';
import { RuneTransaction } from '../../types/rune.types';

describe('RunesHistoryService', () => {
  let service: RunesHistoryService;
  let mockRpcClient: any;
  let mockLogger: any;

  beforeEach(() => {
    mockRpcClient = createMockRpcClient();
    mockLogger = createMockLogger();
    service = new RunesHistoryService(mockRpcClient, mockLogger);
  });

  describe('getTransactionHistory', () => {
    const address = 'testAddress';
    const mockTransactions: RuneTransaction[] = [
      {
        txid: 'tx1',
        type: 'transfer',
        from: 'addr1',
        to: 'addr2',
        amount: '100',
        timestamp: 1234567890
      }
    ];

    it('should get transaction history successfully', async () => {
      mockRpcClient.call.mockResolvedValueOnce(mockTransactions);

      const result = await service.getTransactionHistory(address);
      expect(result).toEqual(mockTransactions);
      expect(mockRpcClient.call).toHaveBeenCalledWith('gettransactionhistory', [address]);
    });

    it('should get transaction history with limit successfully', async () => {
      mockRpcClient.call.mockResolvedValueOnce(mockTransactions);

      const limit = 10;
      const result = await service.getTransactionHistory(address, limit);
      expect(result).toEqual(mockTransactions);
      expect(mockRpcClient.call).toHaveBeenCalledWith('gettransactionhistory', [address, '10']);
    });

    it('should get transaction history with limit and offset successfully', async () => {
      mockRpcClient.call.mockResolvedValueOnce(mockTransactions);

      const limit = 10;
      const offset = 20;
      const result = await service.getTransactionHistory(address, limit, offset);
      expect(result).toEqual(mockTransactions);
      expect(mockRpcClient.call).toHaveBeenCalledWith('gettransactionhistory', [address, '10', '20']);
    });

    it('should handle RPC error', async () => {
      const error = new Error('RPC error');
      mockRpcClient.call.mockRejectedValueOnce(error);

      await expect(service.getTransactionHistory(address)).rejects.toThrow('Failed to get transaction history: RPC error');
    });

    it('should handle unknown error', async () => {
      mockRpcClient.call.mockRejectedValueOnce('Unknown error');

      await expect(service.getTransactionHistory(address)).rejects.toThrow('Failed to get transaction history: Unknown error');
    });
  });

  describe('getTransaction', () => {
    const txid = 'testTxId';
    const mockTransaction: RuneTransaction = {
      txid: 'tx1',
      type: 'transfer',
      from: 'addr1',
      to: 'addr2',
      amount: '100',
      timestamp: 1234567890
    };

    it('should get transaction successfully', async () => {
      mockRpcClient.call.mockResolvedValueOnce(mockTransaction);

      const result = await service.getTransaction(txid);
      expect(result).toEqual(mockTransaction);
      expect(mockRpcClient.call).toHaveBeenCalledWith('gettransaction', [txid]);
    });

    it('should handle RPC error', async () => {
      const error = new Error('RPC error');
      mockRpcClient.call.mockRejectedValueOnce(error);

      await expect(service.getTransaction(txid)).rejects.toThrow('Failed to get transaction: RPC error');
    });

    it('should handle unknown error', async () => {
      mockRpcClient.call.mockRejectedValueOnce('Unknown error');

      await expect(service.getTransaction(txid)).rejects.toThrow('Failed to get transaction: Unknown error');
    });
  });
}); 