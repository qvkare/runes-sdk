import { RuneHistoryService } from '../rune.history.service';
import { RPCClient } from '../../utils/rpc.client';

jest.mock('../../utils/rpc.client');

describe('RuneHistoryService', () => {
  let historyService: RuneHistoryService;
  let mockRpcClient: jest.Mocked<RPCClient>;

  beforeEach(() => {
    mockRpcClient = {
      call: jest.fn()
    } as jest.Mocked<RPCClient>;

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
}); 