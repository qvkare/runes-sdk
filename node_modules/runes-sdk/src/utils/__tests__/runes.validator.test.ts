import { RunesValidator } from '../runes.validator';
import { Logger } from '../logger';
import { RPCClient } from '../rpc.client';
import { createMockLogger, createMockRpcClient } from './test.utils';

describe('RunesValidator', () => {
  let validator: RunesValidator;
  let mockLogger: jest.Mocked<Logger>;
  let mockRpcClient: jest.Mocked<RPCClient>;

  beforeEach(() => {
    mockLogger = createMockLogger('RunesValidator') as jest.Mocked<Logger>;
    mockRpcClient = createMockRpcClient(mockLogger) as jest.Mocked<RPCClient>;
    validator = new RunesValidator(mockRpcClient, mockLogger);
  });

  describe('validateTransfer', () => {
    it('should validate successful transfer', async () => {
      const mockResponse = {
        result: {
          valid: true,
          errors: [],
          warnings: []
        }
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      const result = await validator.validateTransfer({
        runeId: 'rune123',
        amount: '100',
        fromAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        toAddress: '12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX'
      });

      expect(result).toEqual({
        isValid: true,
        errors: [],
        warnings: []
      });
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      const mockResponse = {
        result: {
          valid: false,
          errors: ['Invalid amount'],
          warnings: []
        }
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      const result = await validator.validateTransfer({
        runeId: 'rune123',
        amount: '-100',
        fromAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        toAddress: '12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX'
      });

      expect(result).toEqual({
        isValid: false,
        errors: ['Invalid amount'],
        warnings: []
      });
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should handle RPC errors', async () => {
      mockRpcClient.call.mockRejectedValueOnce(new Error('RPC error'));

      await expect(validator.validateTransfer({
        runeId: 'rune123',
        amount: '100',
        fromAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        toAddress: '12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX'
      })).rejects.toThrow('Failed to validate transfer');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle invalid RPC response', async () => {
      mockRpcClient.call.mockResolvedValueOnce({ result: null });

      await expect(validator.validateTransfer({
        runeId: 'rune123',
        amount: '100',
        fromAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        toAddress: '12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX'
      })).rejects.toThrow('Invalid response from RPC');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to validate transfer:', expect.any(Error));
    });

    it('should handle missing errors and warnings', async () => {
      const mockResponse = {
        result: {
          valid: false
        }
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      const result = await validator.validateTransfer({
        runeId: 'rune123',
        amount: '100',
        fromAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        toAddress: '12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX'
      });

      expect(result).toEqual({
        isValid: false,
        errors: [],
        warnings: []
      });
    });
  });

  describe('validateAddress', () => {
    it('should validate address successfully', async () => {
      const mockResponse = {
        result: {
          isvalid: true
        }
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      const result = await validator.validateAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
      expect(result).toEqual({
        isValid: true,
        errors: [],
        warnings: []
      });
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should handle invalid address', async () => {
      const mockResponse = {
        result: {
          isvalid: false
        }
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      const result = await validator.validateAddress('invalid_address');
      expect(result).toEqual({
        isValid: false,
        errors: ['Invalid address'],
        warnings: []
      });
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should handle RPC errors', async () => {
      mockRpcClient.call.mockRejectedValueOnce(new Error('RPC error'));

      await expect(validator.validateAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')).rejects.toThrow('Failed to validate address');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle invalid RPC response', async () => {
      mockRpcClient.call.mockResolvedValueOnce({ result: null });

      await expect(validator.validateAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')).rejects.toThrow('Invalid response from RPC');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to validate address:', expect.any(Error));
    });

    it('should handle missing isvalid field', async () => {
      const mockResponse = {
        result: {}
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      const result = await validator.validateAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
      expect(result).toEqual({
        isValid: false,
        errors: ['Invalid address'],
        warnings: []
      });
    });
  });

  describe('validateRuneId', () => {
    it('should validate rune ID successfully', async () => {
      const mockResponse = {
        result: {
          exists: true
        }
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      const result = await validator.validateRuneId('rune123');
      expect(result).toEqual({
        isValid: true,
        errors: [],
        warnings: []
      });
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should handle non-existent rune ID', async () => {
      const mockResponse = {
        result: {
          exists: false
        }
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      const result = await validator.validateRuneId('invalid_rune');
      expect(result).toEqual({
        isValid: false,
        errors: ['Invalid rune ID'],
        warnings: []
      });
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should handle RPC errors', async () => {
      mockRpcClient.call.mockRejectedValueOnce(new Error('RPC error'));

      await expect(validator.validateRuneId('rune123')).rejects.toThrow('Failed to validate rune ID');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle invalid RPC response', async () => {
      mockRpcClient.call.mockResolvedValueOnce({ result: null });

      await expect(validator.validateRuneId('rune123')).rejects.toThrow('Invalid response from RPC');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to validate rune ID:', expect.any(Error));
    });

    it('should handle missing exists field', async () => {
      const mockResponse = {
        result: {}
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      const result = await validator.validateRuneId('rune123');
      expect(result).toEqual({
        isValid: false,
        errors: ['Invalid rune ID'],
        warnings: []
      });
    });
  });

  describe('isValidAmount', () => {
    it('should validate positive amount', () => {
      expect(validator.isValidAmount('100')).toBe(true);
    });

    it('should invalidate negative amount', () => {
      expect(validator.isValidAmount('-100')).toBe(false);
    });

    it('should invalidate zero amount', () => {
      expect(validator.isValidAmount('0')).toBe(false);
    });

    it('should invalidate non-numeric amount', () => {
      expect(validator.isValidAmount('abc')).toBe(false);
    });
  });
}); 