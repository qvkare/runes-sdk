import { RuneLiquidityService } from '../rune.liquidity.service';
import { RPCClient } from '../../utils/rpc.client';
import { LiquidityPool } from '../../types/liquidity.types';

jest.mock('../../utils/rpc.client');

describe('RuneLiquidityService', () => {
  let liquidityService: RuneLiquidityService;
  let mockRpcClient: jest.Mocked<RPCClient>;

  beforeEach(() => {
    mockRpcClient = new RPCClient({
      rpcUrl: 'http://localhost:8332',
      username: 'test',
      password: 'test',
      network: 'regtest'
    }) as jest.Mocked<RPCClient>;

    liquidityService = new RuneLiquidityService(mockRpcClient);
  });

  describe('getPool', () => {
    it('should return pool information', async () => {
      const mockPool = {
        id: 'pool1',
        rune: 'RUNE1',
        totalLiquidity: '1000000',
        providers: [
          { address: 'addr1', amount: '500000' },
          { address: 'addr2', amount: '500000' }
        ],
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-02T00:00:00Z'
      };

      mockRpcClient.call.mockResolvedValueOnce(mockPool);

      const result = await liquidityService.getPool('pool1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('pool1');
      expect(result?.rune).toBe('RUNE1');
      expect(result?.totalLiquidity).toBe(BigInt(1000000));
      expect(result?.providers).toHaveLength(2);
      expect(result?.providers[0].address).toBe('addr1');
      expect(result?.providers[0].amount).toBe(BigInt(500000));
    });

    it('should return null for non-existent pool', async () => {
      mockRpcClient.call.mockResolvedValueOnce(null);

      const result = await liquidityService.getPool('non-existent');

      expect(result).toBeNull();
    });

    it('should handle RPC error', async () => {
      mockRpcClient.call.mockRejectedValueOnce(new Error('RPC error'));

      await expect(liquidityService.getPool('pool1')).rejects.toThrow('RPC error');
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
        rune: 'RUNE1',
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
        rune: 'RUNE1',
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