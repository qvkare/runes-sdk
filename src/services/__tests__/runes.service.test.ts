import { RunesService } from '../runes.service';
import { RpcClient } from '../../types/rpc.types';
import { Logger } from '../../types/logger.types';
import { RuneTransfer } from '../../types/rune.types';
import { createMockRpcClient, createMockLogger } from '../../utils/test.utils';

describe('RunesService', () => {
  let service: RunesService;
  let mockRpcClient: jest.Mocked<RpcClient>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockRpcClient = createMockRpcClient();
    mockLogger = createMockLogger();
    service = new RunesService(mockRpcClient, mockLogger);
  });

  describe('transfer', () => {
    it('should transfer runes successfully', async () => {
      const validTransfer: RuneTransfer = {
        runeId: 'rune123',
        sender: 'sender123',
        recipient: 'recipient123',
        amount: '100',
        id: 'transfer123',
        timestamp: Date.now(),
        status: 'pending',
      };

      mockRpcClient.call.mockResolvedValueOnce('txid123');

      const result = await service.transfer(validTransfer);
      expect(result).toBe('txid123');
    });

    it('should throw error when transfer validation fails', async () => {
      const invalidTransfer: RuneTransfer = {
        runeId: '',
        sender: 'sender123',
        recipient: 'recipient123',
        amount: '100',
        id: 'transfer123',
        timestamp: Date.now(),
        status: 'pending',
      };

      await expect(service.transfer(invalidTransfer)).rejects.toThrow(
        'Rune identifier is required'
      );
      expect(mockLogger.error).toHaveBeenCalledWith('Error transferring runes:', expect.any(Error));
    });

    it('should throw error when RPC call fails', async () => {
      const validTransfer: RuneTransfer = {
        runeId: 'rune123',
        sender: 'sender123',
        recipient: 'recipient123',
        amount: '100',
        id: 'transfer123',
        timestamp: Date.now(),
        status: 'pending',
      };

      const error = new Error('RPC error');
      mockRpcClient.call.mockRejectedValueOnce(error);

      await expect(service.transfer(validTransfer)).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith('Error transferring runes:', error);
    });
  });
});
