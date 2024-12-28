import { RunesBatchService } from '../runes.batch.service';
import { RPCClient } from '../../utils/rpc.client';
import { jest } from '@jest/globals';

jest.mock('../../utils/rpc.client');

describe('RunesBatchService', () => {
  let batchService: RunesBatchService;
  let mockRpcClient: jest.Mocked<RPCClient>;

  beforeEach(() => {
    mockRpcClient = new RPCClient({
      baseUrl: 'http://localhost:8332',
    }) as jest.Mocked<RPCClient>;
    batchService = new RunesBatchService(mockRpcClient);
  });

  describe('processBatch', () => {
    it('should process a batch of transfers', async () => {
      const mockResponse = {
        batchId: 'batch1',
        status: 'completed',
        processedCount: 2,
        failedCount: 0,
      };

      mockRpcClient.call.mockResolvedValue(mockResponse);

      const transfers = [
        {
          runesId: 'rune1',
          from: 'addr1',
          to: 'addr2',
          amount: BigInt(1000),
        },
        {
          runesId: 'rune1',
          from: 'addr2',
          to: 'addr3',
          amount: BigInt(2000),
        },
      ];

      const result = await batchService.processBatch(transfers);

      expect(result).toEqual(mockResponse);
      expect(mockRpcClient.call).toHaveBeenCalledWith('processbatch', [transfers]);
    });

    it('should handle batch processing errors', async () => {
      mockRpcClient.call.mockRejectedValue(new Error('Failed to process batch'));

      const transfers = [
        {
          runesId: 'rune1',
          from: 'addr1',
          to: 'addr2',
          amount: BigInt(1000),
        },
      ];

      await expect(batchService.processBatch(transfers)).rejects.toThrow('Failed to process batch');
    });
  });

  describe('getBatchStatus', () => {
    it('should get batch status', async () => {
      const mockResponse = {
        batchId: 'batch1',
        status: 'completed',
        processedCount: 2,
        failedCount: 0,
        completedAt: '2023-01-01T00:00:00Z',
      };

      mockRpcClient.call.mockResolvedValue(mockResponse);

      const result = await batchService.getBatchStatus('batch1');

      expect(result).toEqual(mockResponse);
      expect(mockRpcClient.call).toHaveBeenCalledWith('getbatchstatus', ['batch1']);
    });

    it('should handle batch status errors', async () => {
      mockRpcClient.call.mockRejectedValue(new Error('Failed to get batch status'));

      await expect(batchService.getBatchStatus('batch1')).rejects.toThrow('Failed to get batch status');
    });
  });
}); 