import { RunesSDK } from '../../sdk';
import { createMockLogger } from '../../utils/test.utils';
import { RpcUtils } from '../../utils/rpc.utils';

jest.mock('../../utils/rpc.utils');

describe('RunesSDK', () => {
  let sdk: RunesSDK;
  const mockLogger = createMockLogger();
  const mockRpcUtils = RpcUtils as jest.MockedClass<typeof RpcUtils>;

  beforeEach(() => {
    mockRpcUtils.mockClear();
    sdk = new RunesSDK({
      rpcUrl: 'http://localhost:8332',
      rpcUsername: 'test',
      rpcPassword: 'test',
      logger: mockLogger
    });
  });

  describe('constructor', () => {
    it('should create instance with provided logger', () => {
      const sdkWithLogger = new RunesSDK({
        rpcUrl: 'http://localhost:8332',
        rpcUsername: 'test',
        rpcPassword: 'test',
        logger: mockLogger
      });
      expect(sdkWithLogger).toBeInstanceOf(RunesSDK);
      expect(mockRpcUtils).toHaveBeenCalledWith('http://localhost:8332', 'test', 'test');
    });

    it('should create instance with default console logger', () => {
      const sdkWithDefaultLogger = new RunesSDK({
        rpcUrl: 'http://localhost:8332',
        rpcUsername: 'test',
        rpcPassword: 'test'
      });
      expect(sdkWithDefaultLogger).toBeInstanceOf(RunesSDK);
      expect(mockRpcUtils).toHaveBeenCalledWith('http://localhost:8332', 'test', 'test');
    });
  });

  describe('validateTransaction', () => {
    it('should validate transaction successfully', async () => {
      const mockTxid = 'test-txid';
      mockRpcUtils.prototype.validateTransaction.mockResolvedValue(true);

      const result = await sdk.validateTransaction(mockTxid);
      
      expect(result).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith('Transaction validated successfully:', mockTxid);
    });

    it('should handle validation error', async () => {
      const mockTxid = 'invalid-txid';
      const mockError = new Error('Validation failed');
      mockRpcUtils.prototype.validateTransaction.mockRejectedValue(mockError);

      await expect(sdk.validateTransaction(mockTxid)).rejects.toThrow(mockError);
      expect(mockLogger.error).toHaveBeenCalledWith('Error validating transaction:', mockError);
    });
  });
});
