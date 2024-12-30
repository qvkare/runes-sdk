import { RunesPerformanceService } from '../runes.performance.service';
import { createMockLogger } from '../../utils/__tests__/test.utils';
import { RPCClient } from '../../utils/rpc.client';
import { RunesValidator } from '../../utils/runes.validator';
import { Logger } from '../../utils/logger';
import { BitcoinCoreService } from '../bitcoin-core.service';

describe('RunesPerformanceService', () => {
  let service: RunesPerformanceService;
  let mockRpcClient: jest.Mocked<RPCClient>;
  let mockValidator: jest.Mocked<RunesValidator>;
  let mockLogger: jest.Mocked<Logger>;
  let mockBitcoinCore: jest.Mocked<BitcoinCoreService>;

  beforeEach(() => {
    mockLogger = createMockLogger();
    mockRpcClient = {
      call: jest.fn(),
    } as unknown as jest.Mocked<RPCClient>;

    mockBitcoinCore = {
      getBlockCount: jest.fn(),
      getMemPoolInfo: jest.fn(),
      getRawTransaction: jest.fn(),
      decodeRawTransaction: jest.fn(),
      sendRawTransaction: jest.fn(),
      listUnspent: jest.fn(),
      validateAddress: jest.fn(),
      createRawTransaction: jest.fn(),
      signRawTransaction: jest.fn(),
      rpcClient: {} as any,
      logger: mockLogger,
    } as unknown as jest.Mocked<BitcoinCoreService>;

    mockValidator = {
      validateRuneCreation: jest.fn(),
      validateTransfer: jest.fn(),
      validateRuneId: jest.fn(),
      validateAddress: jest.fn(),
      validateRuneSymbol: jest.fn(),
      validateRuneDecimals: jest.fn(),
      validateRuneAmount: jest.fn(),
      validateRuneTransaction: jest.fn(),
      validateRuneSupply: jest.fn(),
      validateRuneLimit: jest.fn(),
      bitcoinCore: mockBitcoinCore,
      logger: mockLogger,
      isValidSymbol: jest.fn(),
      isValidDecimals: jest.fn(),
      isValidSupply: jest.fn(),
      isValidLimit: jest.fn(),
      isValidAmount: jest.fn(),
    } as unknown as jest.Mocked<RunesValidator>;

    service = new RunesPerformanceService(mockRpcClient, mockValidator);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getRunePerformance', () => {
    const runeId = 'rune123';
    const timeframe = '24h';

    it('should get rune performance successfully', async () => {
      const mockPerformance = {
        price: {
          current: 100,
          change: 5.5,
          high: 110,
          low: 95,
        },
        volume: {
          total: 10000,
          change: 15.2,
        },
        liquidity: {
          total: 50000,
          change: -2.1,
        },
        transactions: {
          count: 150,
          change: 8.3,
        },
      };

      mockValidator.validateRuneSymbol.mockReturnValueOnce(true);
      mockRpcClient.call.mockResolvedValueOnce(mockPerformance);

      const result = await service.getRunePerformance(runeId, timeframe);
      expect(result).toEqual(mockPerformance);
      expect(mockRpcClient.call).toHaveBeenCalledWith('getruneperformance', [runeId, timeframe]);
    });

    it('should handle get performance error', async () => {
      mockValidator.validateRuneSymbol.mockReturnValueOnce(false);
      await expect(service.getRunePerformance(runeId, timeframe)).rejects.toThrow(
        'Invalid rune symbol'
      );
    });
  });

  describe('getMarketStats', () => {
    const timeframe = '24h';

    it('should get market stats successfully', async () => {
      const mockStats = {
        totalVolume: 1000000,
        totalLiquidity: 5000000,
        totalTransactions: 5000,
        activeRunes: 50,
        topPerformers: [
          {
            runeId: 'rune1',
            priceChange: 15.5,
          },
          {
            runeId: 'rune2',
            priceChange: 10.2,
          },
        ],
      };

      mockRpcClient.call.mockResolvedValueOnce(mockStats);

      const result = await service.getMarketStats(timeframe);
      expect(result).toEqual(mockStats);
      expect(mockRpcClient.call).toHaveBeenCalledWith('getmarketstats', [timeframe]);
    });

    it('should handle get market stats error', async () => {
      mockRpcClient.call.mockRejectedValueOnce(new Error('Failed to get market stats'));
      await expect(service.getMarketStats(timeframe)).rejects.toThrow('Failed to get market stats');
    });
  });

  describe('getRuneRanking', () => {
    const metric = 'volume';
    const limit = 10;

    it('should get rune ranking successfully', async () => {
      const mockRanking = {
        runes: [
          {
            runeId: 'rune1',
            value: 1000000,
            rank: 1,
          },
          {
            runeId: 'rune2',
            value: 800000,
            rank: 2,
          },
        ],
        total: 2,
      };

      mockRpcClient.call.mockResolvedValueOnce(mockRanking);

      const result = await service.getRuneRanking(metric, limit);
      expect(result).toEqual(mockRanking);
      expect(mockRpcClient.call).toHaveBeenCalledWith('getruneranking', [metric, limit]);
    });

    it('should handle get ranking error', async () => {
      mockRpcClient.call.mockRejectedValueOnce(new Error('Failed to get ranking'));
      await expect(service.getRuneRanking(metric, limit)).rejects.toThrow('Failed to get ranking');
    });
  });
});
