import { createMockLogger, createMockRpcClient, createMockRpcResponse, createMockValidationResponse } from './test.utils';

describe('Test Utils', () => {
  describe('createMockLogger', () => {
    it('should create a mock logger with default context', () => {
      const logger = createMockLogger();
      expect(logger.context).toBe('TestContext');
      expect(logger.debug).toBeDefined();
      expect(logger.info).toBeDefined();
      expect(logger.warn).toBeDefined();
      expect(logger.error).toBeDefined();
    });

    it('should create a mock logger with custom context', () => {
      const logger = createMockLogger('CustomContext');
      expect(logger.context).toBe('CustomContext');
    });
  });

  describe('createMockRpcClient', () => {
    it('should create a mock RPC client with required methods', () => {
      const logger = createMockLogger();
      const client = createMockRpcClient(logger);

      expect(client.baseUrl).toBe('http://localhost:8332');
      expect(client.call).toBeDefined();
    });
  });

  describe('createMockRpcResponse', () => {
    it('should create a mock RPC response with data', () => {
      const data = { id: 1, name: 'test' };
      const response = createMockRpcResponse(data);
      expect(response.result).toEqual(data);
    });

    it('should create a mock RPC response with null data', () => {
      const response = createMockRpcResponse(null);
      expect(response.result).toBeNull();
    });
  });

  describe('createMockValidationResponse', () => {
    it('should create a successful validation response', () => {
      const response = createMockValidationResponse(true);
      expect(response.result).toEqual({
        valid: true,
        errors: [],
        warnings: []
      });
    });

    it('should create a failed validation response with errors', () => {
      const errors = ['Error 1', 'Error 2'];
      const response = createMockValidationResponse(false, errors);
      expect(response.result).toEqual({
        valid: false,
        errors,
        warnings: []
      });
    });

    it('should create a validation response with warnings', () => {
      const warnings = ['Warning 1'];
      const response = createMockValidationResponse(true, [], warnings);
      expect(response.result).toEqual({
        valid: true,
        errors: [],
        warnings
      });
    });
  });
}); 