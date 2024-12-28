import { RunesLiquidityService } from '../runes.liquidity.service';
import { RPCClient } from '../../utils/rpc.client';

jest.mock('../../utils/rpc.client');

describe('RunesLiquidityService', () => {
  let liquidityService: RunesLiquidityService;
  let mockRpcClient: jest.Mocked<RPCClient>;

  beforeEach(() => {
    mockRpcClient = {
      call: jest.fn(),
      baseUrl: 'http://localhost:8332',
      auth: { username: 'test', password: 'test' },
      timeout: 5000,
      maxRetries: 3,
      retryDelay: 1000,
      network: 'regtest',
      handleError: jest.fn(),
      handleResponse: jest.fn(),
      buildRequestOptions: jest.fn(),
      buildAuthHeader: jest.fn(),
      buildUrl: jest.fn()
    } as unknown as jest.Mocked<RPCClient>;

    liquidityService = new RunesLiquidityService(mockRpcClient);
  });

  describe('getPool', () => {
    it('should get pool details', async () => {
      const mockResponse = {
        id: 'pool1',
        runes: 'RUNES1',
        totalLiquidity: '1000000',
        providers: [
          { address: 'addr1', amount: '500000' },
          { address: 'addr2', amount: '500000' }
        ]
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      const result = await liquidityService.getPool('pool1');

      expect(result.id).toBe('pool1');
      expect(result.runes).toBe('RUNES1');
      expect(result.totalLiquidity).toBe(BigInt('1000000'));
      expect(result.providers.get('addr1')).toBe(BigInt('500000'));
      expect(result.providers.get('addr2')).toBe(BigInt('500000'));
    });

    it('should handle failed pool fetch', async () => {
      mockRpcClient.call.mockRejectedValueOnce(new Error('Failed to fetch pool'));

      await expect(liquidityService.getPool('pool1')).rejects.toThrow('Failed to fetch pool');
    });
  });

  describe('addLiquidity', () => {
    it('should add liquidity successfully', async () => {
      mockRpcClient.call.mockResolvedValueOnce(true);

      const result = await liquidityService.addLiquidity(
        'pool1',
        BigInt(1000000),
        'addr1'
      );

      expect(result).toBe(true);
      expect(mockRpcClient.call).toHaveBeenCalledWith(
        'addliquidity',
        ['pool1', '1000000', 'addr1']
      );
    });

    it('should handle failed liquidity addition', async () => {
      mockRpcClient.call.mockResolvedValueOnce(false);

      const result = await liquidityService.addLiquidity(
        'pool1',
        BigInt(1000000),
        'addr1'
      );

      expect(result).toBe(false);
    });

    it('should handle RPC error during liquidity addition', async () => {
      mockRpcClient.call.mockRejectedValueOnce(new Error('RPC error'));

      await expect(liquidityService.addLiquidity(
        'pool1',
        BigInt(1000000),
        'addr1'
      )).rejects.toThrow('RPC error');
    });
  });

  describe('removeLiquidity', () => {
    it('should remove liquidity successfully', async () => {
      mockRpcClient.call.mockResolvedValueOnce(true);

      const result = await liquidityService.removeLiquidity(
        'pool1',
        BigInt(500000),
        'addr1'
      );

      expect(result).toBe(true);
      expect(mockRpcClient.call).toHaveBeenCalledWith(
        'removeliquidity',
        ['pool1', '500000', 'addr1']
      );
    });

    it('should handle failed liquidity removal', async () => {
      mockRpcClient.call.mockResolvedValueOnce(false);

      const result = await liquidityService.removeLiquidity(
        'pool1',
        BigInt(500000),
        'addr1'
      );

      expect(result).toBe(false);
    });

    it('should handle RPC error during liquidity removal', async () => {
      mockRpcClient.call.mockRejectedValueOnce(new Error('RPC error'));

      await expect(liquidityService.removeLiquidity(
        'pool1',
        BigInt(500000),
        'addr1'
      )).rejects.toThrow('RPC error');
    });
  });

  describe('error handling', () => {
    it('should handle malformed pool data', async () => {
      const malformedPool = {
        id: 'pool1',
        runes: 'RUNES1',
        totalLiquidity: 'invalid',
        providers: [
          { address: 'addr1', amount: 'invalid' }
        ],
        createdAt: 'invalid-date',
        updatedAt: 'invalid-date'
      };

      mockRpcClient.call.mockResolvedValueOnce(malformedPool);

      await expect(liquidityService.getPool('pool1')).rejects.toThrow();
    });

    it('should handle missing provider data', async () => {
      const incompletePool = {
        id: 'pool1',
        runes: 'RUNES1',
        totalLiquidity: '1000000',
        providers: null,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-02T00:00:00Z'
      };

      mockRpcClient.call.mockResolvedValueOnce(incompletePool);

      await expect(liquidityService.getPool('pool1')).rejects.toThrow();
    });
  });
}); 