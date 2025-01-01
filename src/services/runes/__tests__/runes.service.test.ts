import { RunesService } from '../runes.service';
import { RpcClient } from '../../../types/rpc.types';
import { createMockRpcClient, createMockLogger } from '../../../utils/test.utils';

describe('RunesService', () => {
  let service: RunesService;
  let mockRpcClient: jest.Mocked<RpcClient>;
  const mockLogger = createMockLogger();

  beforeEach(() => {
    const baseMockRpcClient = createMockRpcClient();
    mockRpcClient = {
      ...baseMockRpcClient,
      watchTransaction: jest.fn(),
      stopWatchingTransaction: jest.fn(),
      url: 'http://localhost:8332',
      username: 'test',
      password: 'test'
    } as unknown as jest.Mocked<RpcClient>;
    service = new RunesService(mockRpcClient, mockLogger);
  });

  describe('createRune', () => {
    it('should create a rune successfully', async () => {
      const mockResponse = { runeId: 'test-rune-id' };
      mockRpcClient.call.mockResolvedValue(mockResponse);

      const result = await service.createRune('TestRune', '1000000');
      expect(result).toBe('test-rune-id');
      expect(mockRpcClient.call).toHaveBeenCalledWith('createrune', ['TestRune', '1000000']);
    });

    it('should handle creation error', async () => {
      mockRpcClient.call.mockRejectedValue(new Error('Creation failed'));

      await expect(service.createRune('TestRune', '1000000')).rejects.toThrow(
        'Failed to create rune: Error: Creation failed'
      );
    });
  });

  describe('transferRune', () => {
    it('should transfer runes successfully', async () => {
      const mockResponse = { txid: 'test-tx-id' };
      mockRpcClient.call.mockResolvedValue(mockResponse);

      const result = await service.transferRune('test-rune-id', 'recipient-address', '1000');
      expect(result).toBe('test-tx-id');
      expect(mockRpcClient.call).toHaveBeenCalledWith('transferrune', [
        'test-rune-id',
        'recipient-address',
        '1000',
      ]);
    });

    it('should handle transfer error', async () => {
      mockRpcClient.call.mockRejectedValue(new Error('Transfer failed'));

      await expect(
        service.transferRune('test-rune-id', 'recipient-address', '1000')
      ).rejects.toThrow('Failed to transfer rune: Error: Transfer failed');
    });
  });

  describe('getRuneBalance', () => {
    it('should get rune balance successfully', async () => {
      const mockResponse = { balance: '5000' };
      mockRpcClient.call.mockResolvedValue(mockResponse);

      const result = await service.getRuneBalance('test-rune-id', 'test-address');
      expect(result).toBe('5000');
      expect(mockRpcClient.call).toHaveBeenCalledWith('getrunebalance', [
        'test-rune-id',
        'test-address',
      ]);
    });

    it('should handle balance check error', async () => {
      mockRpcClient.call.mockRejectedValue(new Error('Balance check failed'));

      await expect(service.getRuneBalance('test-rune-id', 'test-address')).rejects.toThrow(
        'Failed to get rune balance: Error: Balance check failed'
      );
    });
  });

  describe('getRuneInfo', () => {
    it('should get rune info successfully', async () => {
      const mockResponse = {
        name: 'TestRune',
        supply: '1000000',
        creator: 'test-address',
      };
      mockRpcClient.call.mockResolvedValue(mockResponse);

      const result = await service.getRuneInfo('test-rune-id');
      expect(result).toEqual(mockResponse);
      expect(mockRpcClient.call).toHaveBeenCalledWith('getruneinfo', ['test-rune-id']);
    });

    it('should handle info retrieval error', async () => {
      mockRpcClient.call.mockRejectedValue(new Error('Info retrieval failed'));

      await expect(service.getRuneInfo('test-rune-id')).rejects.toThrow(
        'Failed to get rune info: Error: Info retrieval failed'
      );
    });
  });
});
