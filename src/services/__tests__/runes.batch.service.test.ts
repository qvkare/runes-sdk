import { RunesBatchService } from '../runes.batch.service';
import { createMockLogger, createMockRpcClient, createMockValidator } from '../../utils/test.utils';
import { BatchTransfer } from '../../types/rune.types';

describe('RunesBatchService', () => {
  let service: RunesBatchService;
  let mockRpcClient: any;
  let mockLogger: any;
  let mockValidator: any;

  beforeEach(() => {
    mockRpcClient = createMockRpcClient();
    mockLogger = createMockLogger();
    mockValidator = createMockValidator();
    service = new RunesBatchService(mockRpcClient, mockLogger, mockValidator);
  });

  describe('processBatch', () => {
    const validTransfers: BatchTransfer[] = [
      {
        from: 'addr1',
        to: 'addr2',
        amount: '100',
        symbol: 'RUNE'
      },
      {
        from: 'addr3',
        to: 'addr4',
        amount: '200',
        symbol: 'RUNE'
      }
    ];

    it('should process batch successfully', async () => {
      mockValidator.validateTransfer.mockReturnValue({ isValid: true, errors: [] });
      mockRpcClient.call.mockResolvedValue({ txid: 'tx123' });

      const result = await service.processBatch(validTransfers);

      expect(result.successful.length).toBe(2);
      expect(result.failed.length).toBe(0);
      expect(result.totalTransfers).toBe(2);
      expect(result.successfulTransfers).toBe(2);
      expect(result.failedTransfers).toBe(0);
      expect(result.errors.length).toBe(0);
    });

    it('should handle validation failures', async () => {
      mockValidator.validateTransfer.mockReturnValue({
        isValid: false,
        errors: ['Invalid amount']
      });

      const result = await service.processBatch(validTransfers);

      expect(result.successful.length).toBe(0);
      expect(result.failed.length).toBe(2);
      expect(result.totalTransfers).toBe(2);
      expect(result.successfulTransfers).toBe(0);
      expect(result.failedTransfers).toBe(2);
      expect(result.errors.length).toBe(2);
      expect(result.errors[0].message).toBe('Validation failed: Invalid amount');
    });

    it('should handle RPC errors', async () => {
      mockValidator.validateTransfer.mockReturnValue({ isValid: true, errors: [] });
      mockRpcClient.call.mockRejectedValue(new Error('RPC error'));

      const result = await service.processBatch(validTransfers);

      expect(result.successful.length).toBe(0);
      expect(result.failed.length).toBe(2);
      expect(result.totalTransfers).toBe(2);
      expect(result.successfulTransfers).toBe(0);
      expect(result.failedTransfers).toBe(2);
      expect(result.errors.length).toBe(2);
      expect(result.errors[0].message).toBe('RPC error');
    });

    it('should handle unknown errors', async () => {
      mockValidator.validateTransfer.mockReturnValue({ isValid: true, errors: [] });
      mockRpcClient.call.mockRejectedValue('Unknown error');

      const result = await service.processBatch(validTransfers);

      expect(result.successful.length).toBe(0);
      expect(result.failed.length).toBe(2);
      expect(result.totalTransfers).toBe(2);
      expect(result.successfulTransfers).toBe(0);
      expect(result.failedTransfers).toBe(2);
      expect(result.errors.length).toBe(2);
      expect(result.errors[0].message).toBe('Unknown error occurred');
    });

    it('should handle empty transfers array', async () => {
      const result = await service.processBatch([]);

      expect(result.successful.length).toBe(0);
      expect(result.failed.length).toBe(0);
      expect(result.totalTransfers).toBe(0);
      expect(result.successfulTransfers).toBe(0);
      expect(result.failedTransfers).toBe(0);
      expect(result.errors.length).toBe(0);
    });
  });
}); 