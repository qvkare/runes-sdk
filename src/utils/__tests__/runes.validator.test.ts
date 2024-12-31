import { RunesValidator } from '../runes.validator';
import { createMockLogger, createMockRpcClient } from '../test.utils';
import { RuneTransfer } from '../../types/rune.types';

describe('RunesValidator', () => {
  let validator: RunesValidator;
  let mockRpcClient: any;
  let mockLogger: any;

  beforeEach(() => {
    mockRpcClient = createMockRpcClient();
    mockLogger = createMockLogger();
    validator = new RunesValidator(mockRpcClient, mockLogger);
  });

  describe('validateTransfer', () => {
    const validTransfer: RuneTransfer = {
      from: 'addr1',
      to: 'addr2',
      amount: '100',
      symbol: 'RUNE'
    };

    it('should validate a valid transfer', () => {
      const result = validator.validateTransfer(validTransfer);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.operations).toBeDefined();
      expect(result.operations).toHaveLength(1);
      expect(result.operations?.[0]).toEqual({ type: 'transfer', ...validTransfer });
    });

    it('should invalidate transfer with missing from address', () => {
      const invalidTransfer = { ...validTransfer, from: '' };
      const result = validator.validateTransfer(invalidTransfer);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('From address is required');
      expect(result.operations).toHaveLength(0);
    });

    it('should invalidate transfer with missing to address', () => {
      const invalidTransfer = { ...validTransfer, to: '' };
      const result = validator.validateTransfer(invalidTransfer);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('To address is required');
      expect(result.operations).toHaveLength(0);
    });

    it('should invalidate transfer with missing amount', () => {
      const invalidTransfer = { ...validTransfer, amount: '' };
      const result = validator.validateTransfer(invalidTransfer);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Amount is required');
      expect(result.operations).toHaveLength(0);
    });

    it('should invalidate transfer with invalid amount', () => {
      const invalidTransfer = { ...validTransfer, amount: '-100' };
      const result = validator.validateTransfer(invalidTransfer);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Amount must be a positive number');
      expect(result.operations).toHaveLength(0);
    });

    it('should invalidate transfer with zero amount', () => {
      const invalidTransfer = { ...validTransfer, amount: '0' };
      const result = validator.validateTransfer(invalidTransfer);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Amount must be greater than zero');
      expect(result.operations).toHaveLength(0);
    });

    it('should invalidate transfer with non-numeric amount', () => {
      const invalidTransfer = { ...validTransfer, amount: 'abc' };
      const result = validator.validateTransfer(invalidTransfer);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Amount must be a valid number');
      expect(result.operations).toHaveLength(0);
    });

    it('should invalidate transfer with missing amount', () => {
      const invalidTransfer = { ...validTransfer };
      delete (invalidTransfer as any).amount;
      const result = validator.validateTransfer(invalidTransfer);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Amount is required');
      expect(result.operations).toHaveLength(0);
    });

    it('should invalidate transfer with multiple errors', () => {
      const invalidTransfer = { ...validTransfer, from: '', to: '', amount: '-100' };
      const result = validator.validateTransfer(invalidTransfer);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('From address is required');
      expect(result.errors).toContain('To address is required');
      expect(result.errors).toContain('Amount must be a positive number');
      expect(result.operations).toHaveLength(0);
    });
  });
}); 