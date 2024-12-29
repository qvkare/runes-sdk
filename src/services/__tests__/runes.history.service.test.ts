import { RunesHistoryService } from '../runes.history.service';
import { RPCClient } from '../../utils/rpc.client';
import { Logger } from '../../utils/logger';
import { createMockLogger, createMockRpcClient } from '../../utils/__tests__/test.utils';
import { TransactionHistory } from '../../types';

describe('RunesHistoryService', () => {
  let historyService: RunesHistoryService;
  let mockRpcClient: jest.Mocked<RPCClient>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockLogger = createMockLogger('RunesHistoryService');
    mockRpcClient = createMockRpcClient(mockLogger);
    historyService = new RunesHistoryService(mockRpcClient, mockLogger);
  });

  describe('getTransactionHistory', () => {
    it('should get transaction history successfully', async () => {
      const runeId = 'rune123';
      const mockHistory: TransactionHistory[] = [
        {
          txId: 'tx123',
          timestamp: '2024-01-01T00:00:00Z',
          type: 'transfer',
          amount: '100',
          status: 'confirmed'
        }
      ];

      const mockResponse = {
        result: mockHistory
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      const result = await historyService.getTransactionHistory(runeId);
      expect(result).toEqual(mockHistory);
      expect(mockRpcClient.call).toHaveBeenCalledWith('gettransactionhistory', [runeId]);
    });

    it('should handle RPC errors', async () => {
      const runeId = 'invalid_rune';
      mockRpcClient.call.mockRejectedValueOnce(new Error('RPC error'));

      await expect(historyService.getTransactionHistory(runeId)).rejects.toThrow('Failed to get transaction history');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
}); 