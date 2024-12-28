import { RunesHistoryService } from '../runes.history.service';
import { RPCClient } from '../../utils/rpc.client';
import { jest } from '@jest/globals';

jest.mock('../../utils/rpc.client');

describe('RunesHistoryService', () => {
  let historyService: RunesHistoryService;
  let mockRpcClient: jest.Mocked<RPCClient>;

  beforeEach(() => {
    mockRpcClient = new RPCClient({
      baseUrl: 'http://localhost:8332',
    }) as jest.Mocked<RPCClient>;
    historyService = new RunesHistoryService(mockRpcClient);
  });

  describe('getRunesHistory', () => {
    it('should handle RPC errors', async () => {
      mockRpcClient.call.mockRejectedValue(new Error('Failed to fetch runes history'));

      await expect(historyService.getRunesHistory(1000, 2000)).rejects.toThrow(
        'Failed to fetch runes history'
      );
    });

    it('should return transfer history', async () => {
      const mockResponse = {
        transfers: [
          {
            txid: 'tx1',
            from: 'addr1',
            to: 'addr2',
            amount: '1000',
            timestamp: 1234567890,
          },
        ],
        totalCount: 1,
      };

      mockRpcClient.call.mockResolvedValue(mockResponse);

      const result = await historyService.getRunesHistory(1000, 2000);

      expect(result).toEqual(mockResponse);
      expect(mockRpcClient.call).toHaveBeenCalledWith('getruneshistory', [1000, 2000]);
    });
  });

  describe('getAddressHistory', () => {
    it('should handle RPC errors', async () => {
      mockRpcClient.call.mockRejectedValue(new Error('Failed to fetch address history'));

      await expect(historyService.getAddressHistory('addr1')).rejects.toThrow(
        'Failed to fetch address history'
      );
    });

    it('should return address history', async () => {
      const mockResponse = {
        transfers: [
          {
            txid: 'tx1',
            type: 'send',
            amount: '1000',
            timestamp: 1234567890,
          },
        ],
      };

      mockRpcClient.call.mockResolvedValue(mockResponse);

      const result = await historyService.getAddressHistory('addr1');

      expect(result).toEqual(mockResponse);
      expect(mockRpcClient.call).toHaveBeenCalledWith('getaddresshistory', ['addr1']);
    });
  });

  describe('getTransferStats', () => {
    it('should handle RPC errors', async () => {
      mockRpcClient.call.mockRejectedValue(new Error('Failed to fetch transfers'));

      await expect(historyService.getTransferStats(1234567890, 1234567899)).rejects.toThrow(
        'Failed to fetch transfers'
      );
    });

    it('should return transfer statistics', async () => {
      const mockResponse = {
        totalTransfers: 100,
        totalVolume: '1000000',
        averageAmount: '10000',
        timeRange: {
          start: 1234567890,
          end: 1234567899,
        },
      };

      mockRpcClient.call.mockResolvedValue(mockResponse);

      const result = await historyService.getTransferStats(1234567890, 1234567899);

      expect(result).toEqual(mockResponse);
      expect(mockRpcClient.call).toHaveBeenCalledWith('gettransferstats', [1234567890, 1234567899]);
    });
  });
}); 