import { ValidationService } from '../validation.service';
import { RpcClient as IRpcClient } from '../../../types/rpc.types';
import { Logger } from '../../../types/logger.types';
import { Transaction } from '../../../types/transaction.types';
import { ValidationConfig } from '../../../types/validation.types';
import {
  createMockRpcClient,
  createMockLogger,
  createMockTransaction,
} from '../../../utils/test.utils';

describe('ValidationService', () => {
  let validationService: ValidationService;
  let mockRpcClient: jest.Mocked<IRpcClient>;
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
      maxTransactionAmount: '1000000000',
    };
    validationService = new ValidationService(mockRpcClient, mockLogger, mockConfig);
  });

  it('should validate transaction successfully', async () => {
    const mockTransaction = createMockTransaction();
    mockRpcClient.validateTransaction.mockResolvedValueOnce(true);

    const result = await validationService.validateTransaction(mockTransaction);
    expect(result).toBe(true);
    expect(mockRpcClient.validateTransaction).toHaveBeenCalledWith(mockTransaction.txid);
  });

  it('should handle validation failure', async () => {
    const mockTransaction = createMockTransaction();
    mockRpcClient.validateTransaction.mockResolvedValueOnce(false);

    const result = await validationService.validateTransaction(mockTransaction);
    expect(result).toBe(false);
    expect(mockRpcClient.validateTransaction).toHaveBeenCalledWith(mockTransaction.txid);
  });

  it('should handle validation error', async () => {
    const mockTransaction = createMockTransaction();
    const error = new Error('Validation failed');
    mockRpcClient.validateTransaction.mockRejectedValueOnce(error);

    await expect(validationService.validateTransaction(mockTransaction)).rejects.toThrow(error);
    expect(mockRpcClient.validateTransaction).toHaveBeenCalledWith(mockTransaction.txid);
    expect(mockLogger.error).toHaveBeenCalledWith('Error validating transaction:', error);
  });
});
