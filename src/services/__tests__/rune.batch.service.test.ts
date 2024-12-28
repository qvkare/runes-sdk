import { RuneBatchService } from '../rune.batch.service';
import { RuneService } from '../rune.service';
import { RPCClient } from '../../utils/rpc.client';
import { BatchTransferResult } from '../../types/rune.types';

jest.mock('../rune.service');

describe('RuneBatchService', () => {
  let runeBatchService: RuneBatchService;
  let runeService: jest.Mocked<RuneService>;

  beforeEach(() => {
    runeService = {
      createTransfer: jest.fn(),
      validateTransfer: jest.fn(),
      getTransferStatus: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn()
    } as unknown as jest.Mocked<RuneService>;
    runeBatchService = new RuneBatchService(runeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processBatchTransfers', () => {
    it('should process multiple transfers successfully', async () => {
      const transfers = [
        { from: 'address1', to: 'address2', amount: BigInt(100) },
        { from: 'address3', to: 'address4', amount: BigInt(200) }
      ];

      runeService.createTransfer
        .mockResolvedValueOnce('tx1')
        .mockResolvedValueOnce('tx2');

      const results = await runeBatchService.processBatchTransfers(transfers);

      expect(runeService.createTransfer).toHaveBeenCalledTimes(2);
      expect(runeService.createTransfer).toHaveBeenNthCalledWith(1, 
        transfers[0].from,
        transfers[0].to,
        transfers[0].amount
      );
      expect(runeService.createTransfer).toHaveBeenNthCalledWith(2,
        transfers[1].from,
        transfers[1].to,
        transfers[1].amount
      );

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({
        id: 'tx1',
        txid: 'tx1',
        status: 'success'
      });
      expect(results[1]).toEqual({
        id: 'tx2',
        txid: 'tx2',
        status: 'success'
      });
    });

    it('should handle failed transfers', async () => {
      const transfers = [
        { from: 'address1', to: 'address2', amount: BigInt(100) },
        { from: 'address3', to: 'address4', amount: BigInt(200) }
      ];

      runeService.createTransfer
        .mockResolvedValueOnce('tx1')
        .mockRejectedValueOnce(new Error('Transfer failed'));

      const results = await runeBatchService.processBatchTransfers(transfers);

      expect(runeService.createTransfer).toHaveBeenCalledTimes(2);
      expect(runeService.createTransfer).toHaveBeenNthCalledWith(1,
        transfers[0].from,
        transfers[0].to,
        transfers[0].amount
      );
      expect(runeService.createTransfer).toHaveBeenNthCalledWith(2,
        transfers[1].from,
        transfers[1].to,
        transfers[1].amount
      );

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({
        id: 'tx1',
        txid: 'tx1',
        status: 'success'
      });
      expect(results[1]).toEqual({
        id: '',
        txid: '',
        status: 'failed',
        error: 'Transfer failed'
      });
    });
  });
}); 