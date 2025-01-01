import { ValidationService } from './validation.service';
import { RpcClient } from '../../types/rpc.types';
import { Logger } from '../../types/logger.types';
import { createMockRpcClient, createMockLogger } from '../../utils/test.utils';
import { Transaction } from '../../types/transaction.types';
import { ValidationConfig } from '../../types/validation.types';

describe('ValidationService', () => {
  let validationService: ValidationService;
  let mockRpcClient: jest.Mocked<RpcClient>;
  let mockLogger: jest.Mocked<Logger>;
  let mockConfig: ValidationConfig;

  beforeEach(() => {
    mockRpcClient = createMockRpcClient();
    mockLogger = createMockLogger();
    mockConfig = {
      addressRegex: /^[a-zA-Z0-9]{34}$/,
      minConfirmations: 1,
      maxTransactionSize: 100000,
      minFee: '1000',
      maxFee: '1000000',
      maxTransactionAmount: '1000000000'
    };
    validationService = new ValidationService(mockRpcClient, mockLogger, mockConfig);
  });

  describe('validateTransaction', () => {
    it('should validate transaction successfully', async () => {
      const mockTransaction: Transaction = {
        id: 'test-id',
        txid: 'test-txid',
        type: 'transfer',
        blockHash: 'test-block-hash',
        blockHeight: 100,
        amount: '100',
        fee: '1000',
        confirmations: 1,
        timestamp: Date.now(),
        sender: 'test-sender',
        recipient: 'test-recipient',
        size: 100,
        time: Date.now(),
        version: 1
      };

      mockRpcClient.validateTransaction.mockResolvedValueOnce(true);

      const result = await validationService.validateTransaction(mockTransaction);
      expect(result).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith('Transaction validated successfully:', mockTransaction.txid);
    });

    it('should handle validation error', async () => {
      const mockTransaction: Transaction = {
        id: 'test-id',
        txid: 'test-txid',
        type: 'transfer',
        blockHash: 'test-block-hash',
        blockHeight: 100,
        amount: '100',
        fee: '1000',
        confirmations: 1,
        timestamp: Date.now(),
        sender: 'test-sender',
        recipient: 'test-recipient',
        size: 100,
        time: Date.now(),
        version: 1
      };

      const error = new Error('Validation failed');
      mockRpcClient.validateTransaction.mockRejectedValueOnce(error);

      await expect(validationService.validateTransaction(mockTransaction)).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith('Error validating transaction:', error);
    });
  });
});
