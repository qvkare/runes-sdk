import { RuneHistoryService } from '../rune.history.service';
import { RPCClient } from '../../utils/rpc.client';
import { BitcoinConfig } from '../../config/bitcoin.config';

jest.mock('../../utils/rpc.client');

describe('RuneHistoryService', () => {
  let historyService: RuneHistoryService;
  let mockRpcClient: jest.Mocked<RPCClient>;

  beforeEach(() => {
    const mockConfig: BitcoinConfig = {
      rpcUrl: 'http://localhost:8332',
      username: 'test',
      password: 'test',
      timeout: 30000,
      maxRetries: 3,
      network: 'testnet'
    };

    mockRpcClient = {
      baseUrl: mockConfig.rpcUrl,
      auth: Buffer.from(`${mockConfig.username}:${mockConfig.password}`).toString('base64'),
      timeout: mockConfig.timeout,
      maxRetries: mockConfig.maxRetries,
      retryDelay: 1000,
      config: mockConfig,
      logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() },
      call: jest.fn()
    } as unknown as jest.Mocked<RPCClient>;

    historyService = new RuneHistoryService();
    (historyService as any).rpcClient = mockRpcClient;
  });

  describe('getRuneHistory', () => {
    it('should get rune transfer history', async () => {
      const mockTransfers = [
        {
          txid: 'tx1',
          rune: 'RUNE1',
          amount: '1000',
          from: 'addr1',
          to: 'addr2',
          timestamp: Date.now(),
          blockHeight: 100,
          status: 'confirmed'
        },
        {
          txid: 'tx2',
          rune: 'RUNE1',
          amount: '2000',
          from: 'addr2',
          to: 'addr3',
          timestamp: Date.now(),
          blockHeight: 101,
          status: 'confirmed'
        }
      ];

      mockRpcClient.call.mockResolvedValueOnce(mockTransfers);

      const history = await historyService.getRuneHistory('RUNE1', 100, 101);

      expect(history.transfers).toHaveLength(2);
      expect(history.transfers[0].txid).toBe('tx1');
      expect(history.transfers[0].amount).toBe('1000');
      expect(history.transfers[1].txid).toBe('tx2');
      expect(history.transfers[1].amount).toBe('2000');
      expect(history.totalCount).toBe(2);
      expect(history.startBlock).toBe(100);
      expect(history.endBlock).toBe(101);
    });

    it('should handle rune history errors', async () => {
      mockRpcClient.call.mockRejectedValueOnce(new Error('Failed to fetch rune history'));

      await expect(historyService.getRuneHistory('RUNE1', 100, 101))
        .rejects.toThrow('Failed to get rune history');
    });
  });

  describe('getAddressHistory', () => {
    it('should get address transfer history', async () => {
      const mockTransfers = {
        sent: [
          {
            txid: 'tx1',
            amount: '1000',
            timestamp: Date.now()
          }
        ],
        received: [
          {
            txid: 'tx2',
            amount: '2000',
            timestamp: Date.now()
          }
        ]
      };

      mockRpcClient.call.mockResolvedValueOnce(mockTransfers);

      const history = await historyService.getAddressHistory('addr1', 100, 101);

      expect(history.sent).toHaveLength(1);
      expect(history.received).toHaveLength(1);
      expect(history.sent[0].txid).toBe('tx1');
      expect(history.received[0].txid).toBe('tx2');
      expect(history.totalSent).toBe('1000');
      expect(history.totalReceived).toBe('2000');
    });

    it('should handle address history errors', async () => {
      mockRpcClient.call.mockRejectedValueOnce(new Error('Failed to fetch address history'));

      await expect(historyService.getAddressHistory('addr1', 100, 101))
        .rejects.toThrow('Failed to get address history');
    });
  });

  describe('getTransferStats', () => {
    it('should get transfer statistics for a rune', async () => {
      const mockTransfers = [
        {
          txid: 'tx1',
          rune: 'RUNE1',
          amount: '1000',
          from: 'addr1',
          to: 'addr2',
          timestamp: Date.now(),
          blockHeight: 100,
          status: 'confirmed'
        },
        {
          txid: 'tx2',
          rune: 'RUNE1',
          amount: '2000',
          from: 'addr2',
          to: 'addr3',
          timestamp: Date.now(),
          blockHeight: 101,
          status: 'confirmed'
        }
      ];

      mockRpcClient.call.mockResolvedValueOnce(mockTransfers);

      const stats = await historyService.getTransferStats('RUNE1');

      expect(stats.totalTransfers).toBe(2);
      expect(stats.totalVolume).toBe('3000');
      expect(stats.averageAmount).toBe('1500');
      expect(stats.largestAmount).toBe('2000');
      expect(stats.smallestAmount).toBe('1000');
      expect(stats.timeRange.start).toBe(0);
      expect(stats.timeRange.end).toBeDefined();
    });

    it('should handle empty transfer statistics', async () => {
      mockRpcClient.call.mockResolvedValueOnce([]);

      const stats = await historyService.getTransferStats('RUNE1');

      expect(stats.totalTransfers).toBe(0);
      expect(stats.totalVolume).toBe('0');
      expect(stats.averageAmount).toBe('0');
      expect(stats.largestAmount).toBe('0');
      expect(stats.smallestAmount).toBe('0');
      expect(stats.timeRange.start).toBe(0);
      expect(stats.timeRange.end).toBeDefined();
    });

    it('should handle transfer statistics errors', async () => {
      mockRpcClient.call.mockRejectedValueOnce(new Error('Failed to fetch transfers'));

      await expect(historyService.getTransferStats('RUNE1'))
        .rejects.toThrow('Failed to get transfer stats');
    });
  });

  describe('_getTransfersByTimeRange', () => {
    it('should get transfers within a time range', async () => {
      const mockTransfers = [
        {
          txid: 'tx1',
          rune: 'RUNE1',
          amount: '1000',
          from: 'addr1',
          to: 'addr2',
          timestamp: Date.now(),
          blockHeight: 100,
          status: 'confirmed'
        }
      ];

      mockRpcClient.call.mockResolvedValueOnce(mockTransfers);

      const transfers = await (historyService as any)._getTransfersByTimeRange(0, Date.now());

      expect(transfers).toHaveLength(1);
      expect(transfers[0].txid).toBe('tx1');
      expect(transfers[0].amount).toBe('1000');
      expect(transfers[0].status).toBe('confirmed');
    });

    it('should handle time range transfer errors', async () => {
      mockRpcClient.call.mockRejectedValueOnce(new Error('Failed to fetch transfers'));

      await expect((historyService as any)._getTransfersByTimeRange(0, Date.now()))
        .rejects.toThrow('Failed to fetch transfers');
    });
  });
}); 