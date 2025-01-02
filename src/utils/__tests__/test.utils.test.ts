import { createMockLogger, createMockRPCClient, createMockValidationService } from '../test.utils';
import { LogLevel } from '../logger';

describe('Test Utils', () => {
  describe('createMockLogger', () => {
    it('should create a mock logger with all required methods', () => {
      const mockLogger = createMockLogger();

      expect(mockLogger.context).toBe('test');
      expect(mockLogger.level).toBe(LogLevel.INFO);
      expect(mockLogger.setLevel).toBeDefined();
      expect(mockLogger.getLevel).toBeDefined();
      expect(mockLogger.shouldLog).toBeDefined();
      expect(mockLogger.debug).toBeDefined();
      expect(mockLogger.info).toBeDefined();
      expect(mockLogger.warn).toBeDefined();
      expect(mockLogger.error).toBeDefined();
    });
  });

  describe('createMockRPCClient', () => {
    it('should create a mock RPC client with all required methods', () => {
      const mockRpcClient = createMockRPCClient();

      expect(mockRpcClient.url).toBe('test-url');
      expect(mockRpcClient.username).toBe('test-user');
      expect(mockRpcClient.password).toBe('test-pass');
      expect(mockRpcClient.logger).toBeDefined();
      expect(mockRpcClient.call).toBeDefined();
      expect(mockRpcClient.getRawTransaction).toBeDefined();
      expect(mockRpcClient.sendRawTransaction).toBeDefined();
      expect(mockRpcClient.getBlockCount).toBeDefined();
      expect(mockRpcClient.getBlockHash).toBeDefined();
      expect(mockRpcClient.getBlock).toBeDefined();
    });
  });

  describe('createMockValidationService', () => {
    it('should create a mock validation service with all required methods', () => {
      const mockValidationService = createMockValidationService();

      expect(mockValidationService.config).toBeDefined();
      expect(mockValidationService.config.maxTransactionSize).toBe(1000000);
      expect(mockValidationService.config.requiredConfirmations).toBe(6);
      expect(mockValidationService.config.validateSignatures).toBe(true);
      expect(mockValidationService.config.validateFees).toBe(true);
      expect(mockValidationService.validateTransaction).toBeDefined();
      expect(mockValidationService.validateAddress).toBeDefined();
      expect(mockValidationService.validateAmount).toBeDefined();
      expect(mockValidationService.validateFee).toBeDefined();
      expect(mockValidationService.validateBasicFields).toBeDefined();
    });
  });
});
