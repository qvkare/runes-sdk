import { RunesBatchService } from '../runes.batch.service';
import { RpcClient } from '../../../../types/rpc.types';
import { Logger } from '../../../../types/logger.types';
import { BatchTransfer } from '../../../../types/rune.types';
import { createMockRpcClient, createMockLogger } from '../../../../utils/test.utils';

describe('RunesBatchService', () => {
  let service: RunesBatchService;
  let mockRpcClient: jest.Mocked<RpcClient>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockRpcClient = createMockRpcClient();
    mockLogger = createMockLogger();
    service = new RunesBatchService(mockRpcClient, mockLogger);
  });

  describe('processBatchTransfer', () => {
    it('should process batch transfers successfully', async () => {
      const transfers: BatchTransfer[] = [
        {
          token: 'token1',
          amount: '100',
          sender: 'sender1',
          recipient: 'recipient1',
        },
        {
          token: 'token2',
          amount: '200',
          sender: 'sender2',
          recipient: 'recipient2',
        },
      ];

      mockRpcClient.sendTransaction.mockResolvedValueOnce('txid1');
      mockRpcClient.sendTransaction.mockResolvedValueOnce('txid2');

      const result = await service.processBatchTransfer(transfers);
      expect(result).toEqual(['txid1', 'txid2']);
      expect(mockRpcClient.sendTransaction).toHaveBeenCalledTimes(2);
    });

    it('should handle error during batch transfer', async () => {
      const transfers: BatchTransfer[] = [
        {
          token: 'token1',
          amount: '100',
          sender: 'sender1',
          recipient: 'recipient1',
        },
      ];

      const error = new Error('Failed to process transfer');
      mockRpcClient.sendTransaction.mockRejectedValueOnce(error);

      await expect(service.processBatchTransfer(transfers)).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith('Error processing batch transfer:', error);
    });
  });
});
