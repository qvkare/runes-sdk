import { jest } from '@jest/globals';
import { RunesValidator } from '../runes.validator';
import { BitcoinCoreService } from '../../services/bitcoin-core.service';
import { Logger } from '../logger';
import { CreateRuneParams, TransferRuneParams } from '../../types';

describe('RunesValidator', () => {
  let validator: RunesValidator;
  let mockBitcoinCore: jest.Mocked<BitcoinCoreService>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
    } as jest.Mocked<Logger>;

    mockBitcoinCore = {
      validateAddress: jest.fn(),
      getBlockCount: jest.fn(),
      getMemPoolInfo: jest.fn(),
      getRawTransaction: jest.fn(),
      decodeRawTransaction: jest.fn(),
      sendRawTransaction: jest.fn(),
      listUnspent: jest.fn(),
      createRawTransaction: jest.fn(),
      signRawTransaction: jest.fn(),
      logger: mockLogger,
    } as unknown as jest.Mocked<BitcoinCoreService>;

    validator = new RunesValidator(mockBitcoinCore, mockLogger);
  });

  describe('validateRuneId', () => {
    it('should validate valid rune ID', async () => {
      const runeId = 'VALID123';
      mockBitcoinCore.validateAddress.mockResolvedValueOnce(true);

      const result = await validator.validateRuneId(runeId);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid rune ID', async () => {
      const runeId = '';
      mockBitcoinCore.validateAddress.mockResolvedValueOnce(false);

      const result = await validator.validateRuneId(runeId);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid rune ID format');
    });
  });

  describe('validateAddress', () => {
    it('should validate valid address', async () => {
      const address = 'bc1qvalid';
      mockBitcoinCore.validateAddress.mockResolvedValueOnce(true);

      const result = await validator.validateAddress(address);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid address', async () => {
      const address = 'invalid';
      mockBitcoinCore.validateAddress.mockResolvedValueOnce(false);

      const result = await validator.validateAddress(address);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid Bitcoin address');
    });
  });

  describe('validateRuneCreation', () => {
    const validParams: CreateRuneParams = {
      symbol: 'TEST',
      decimals: 8,
      supply: 1000,
      limit: 10000,
    };

    it('should validate valid creation params', async () => {
      const result = await validator.validateRuneCreation(validParams);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid symbol', async () => {
      const params: CreateRuneParams = { ...validParams, symbol: '' };
      const result = await validator.validateRuneCreation(params);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid symbol format');
    });

    it('should reject invalid decimals', async () => {
      const params: CreateRuneParams = { ...validParams, decimals: -1 };
      const result = await validator.validateRuneCreation(params);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid decimals value');
    });

    it('should reject invalid supply', async () => {
      const params: CreateRuneParams = { ...validParams, supply: 0 };
      const result = await validator.validateRuneCreation(params);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid supply value');
    });

    it('should reject invalid limit', async () => {
      const params: CreateRuneParams = { ...validParams, limit: -1 };
      const result = await validator.validateRuneCreation(params);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid limit value');
    });
  });

  describe('validateTransfer', () => {
    const validParams: TransferRuneParams = {
      runeId: 'TEST123',
      amount: 100,
      recipient: 'bc1qvalid',
    };

    it('should validate valid transfer params', async () => {
      mockBitcoinCore.validateAddress.mockResolvedValueOnce(true);
      mockBitcoinCore.getRawTransaction.mockResolvedValueOnce({});

      const result = await validator.validateTransfer(validParams);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid rune ID', async () => {
      const params: TransferRuneParams = { ...validParams, runeId: '' };
      mockBitcoinCore.validateAddress.mockResolvedValueOnce(true);

      const result = await validator.validateTransfer(params);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid rune ID format');
    });

    it('should reject invalid amount', async () => {
      const params: TransferRuneParams = { ...validParams, amount: 0 };
      mockBitcoinCore.validateAddress.mockResolvedValueOnce(true);
      mockBitcoinCore.getRawTransaction.mockResolvedValueOnce({});

      const result = await validator.validateTransfer(params);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid amount value');
    });

    it('should reject invalid recipient', async () => {
      mockBitcoinCore.validateAddress.mockResolvedValueOnce(false);
      mockBitcoinCore.getRawTransaction.mockResolvedValueOnce({});

      const params: TransferRuneParams = { ...validParams, recipient: 'invalid' };
      const result = await validator.validateTransfer(params);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid recipient address');
    });
  });
});
