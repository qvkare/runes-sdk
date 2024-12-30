import { RunesService } from '../runes.service';
import { BitcoinCoreService } from '../bitcoin-core.service';
import { RunesBatchService } from '../runes.batch.service';
import { RunesHistoryService } from '../runes.history.service';
import { RunesValidator } from '../runes.validator';
import { RunesSecurityService } from '../runes.security.service';
import { CreateRuneParams, TransferRuneParams, ValidationResult } from '../../types';
import { Logger } from '../../utils/logger';
import { createMockLogger, createMockBitcoinCore } from '../../utils/__tests__/test.utils';

describe('RunesService', () => {
  let service: RunesService;
  let mockLogger: jest.Mocked<Logger>;
  let mockBitcoinCore: jest.Mocked<BitcoinCoreService>;
  let mockHistoryService: jest.Mocked<RunesHistoryService>;
  let mockSecurityService: jest.Mocked<RunesSecurityService>;
  let mockBatchService: jest.Mocked<RunesBatchService>;
  let mockValidator: jest.Mocked<RunesValidator>;

  beforeEach(() => {
    mockLogger = createMockLogger();
    mockBitcoinCore = createMockBitcoinCore();
    mockHistoryService = {
      getRuneHistory: jest.fn(),
    } as unknown as jest.Mocked<RunesHistoryService>;
    mockSecurityService = {
      validateRuneCreation: jest.fn(),
      validateRuneTransfer: jest.fn(),
    } as unknown as jest.Mocked<RunesSecurityService>;
    mockBatchService = {
      createRune: jest.fn(),
      transferRune: jest.fn(),
    } as unknown as jest.Mocked<RunesBatchService>;
    mockValidator = {
      validateRuneId: jest.fn(),
      validateAddress: jest.fn(),
      validateRuneSymbol: jest.fn(),
      validateRuneDecimals: jest.fn(),
      validateRuneAmount: jest.fn(),
      validateRuneTransaction: jest.fn(),
      validateRuneSupply: jest.fn(),
      validateRuneLimit: jest.fn(),
      bitcoinCore: mockBitcoinCore,
      logger: mockLogger,
      isValidSymbol: jest.fn(),
      isValidDecimals: jest.fn(),
      isValidSupply: jest.fn(),
      isValidLimit: jest.fn(),
      isValidAmount: jest.fn(),
    } as unknown as jest.Mocked<RunesValidator>;

    service = new RunesService(
      mockBitcoinCore,
      mockLogger,
      mockHistoryService,
      mockSecurityService,
      mockBatchService,
      mockValidator
    );
  });

  describe('createRune', () => {
    const createParams: CreateRuneParams = {
      symbol: 'TEST',
      decimals: 8,
      supply: 1000,
      limit: 1000,
    };

    it('should create a rune successfully', async () => {
      const mockValidation: ValidationResult = { isValid: true, errors: [] };
      mockValidator.validateRuneCreation.mockResolvedValueOnce(mockValidation);
      mockBatchService.createRune.mockResolvedValueOnce({ txId: 'txid123' });

      const result = await service.createRune(createParams);
      expect(result.txId).toBe('txid123');
    });

    it('should throw error on invalid params', async () => {
      const mockValidation: ValidationResult = {
        isValid: false,
        errors: ['Invalid symbol'],
      };
      mockValidator.validateRuneCreation.mockResolvedValueOnce(mockValidation);

      await expect(service.createRune(createParams)).rejects.toThrow('Invalid symbol');
    });
  });

  describe('transferRune', () => {
    const transferParams: TransferRuneParams = {
      runeId: 'rune123',
      amount: 100,
      recipient: 'addr123',
    };

    it('should transfer rune successfully', async () => {
      const mockValidation: ValidationResult = { isValid: true, errors: [] };
      mockValidator.validateTransfer.mockResolvedValueOnce(mockValidation);
      mockBatchService.transferRune.mockResolvedValueOnce({ txId: 'txid123' });

      const result = await service.transferRune(transferParams);
      expect(result.txId).toBe('txid123');
    });

    it('should throw error on invalid transfer', async () => {
      const mockValidation: ValidationResult = {
        isValid: false,
        errors: ['Invalid amount'],
      };
      mockValidator.validateTransfer.mockResolvedValueOnce(mockValidation);

      await expect(service.transferRune(transferParams)).rejects.toThrow('Invalid amount');
    });
  });

  describe('getRuneHistory', () => {
    const runeId = 'rune123';

    it('should get rune history successfully', async () => {
      const mockValidation: ValidationResult = { isValid: true, errors: [] };
      mockValidator.validateRuneId.mockResolvedValueOnce(mockValidation);

      const mockHistory = [
        {
          txid: 'tx1',
          type: 'transfer' as const,
          timestamp: Date.now(),
          details: {
            runeId,
            amount: 100,
            from: 'addr1',
            to: 'addr2',
          },
        },
      ];

      mockHistoryService.getRuneHistory.mockResolvedValueOnce(mockHistory);

      const result = await service.getRuneHistory(runeId);
      expect(result).toEqual(mockHistory);
    });

    it('should throw error on invalid rune ID', async () => {
      const mockValidation: ValidationResult = {
        isValid: false,
        errors: ['Invalid rune ID'],
      };
      mockValidator.validateRuneId.mockResolvedValueOnce(mockValidation);

      await expect(service.getRuneHistory(runeId)).rejects.toThrow('Invalid rune ID');
    });
  });

  describe('getRuneBalance', () => {
    const runeId = 'rune123';
    const address = 'addr123';

    it('should get rune balance successfully', async () => {
      const mockRuneValidation: ValidationResult = { isValid: true, errors: [] };
      const mockAddressValidation: ValidationResult = { isValid: true, errors: [] };

      mockValidator.validateRuneId.mockResolvedValueOnce(mockRuneValidation);
      mockValidator.validateAddress.mockResolvedValueOnce(mockAddressValidation);
      mockBatchService.getRuneBalance.mockResolvedValueOnce(100);

      const result = await service.getRuneBalance(runeId, address);
      expect(result).toBe(100);
    });

    it('should throw error on invalid rune ID', async () => {
      const mockRuneValidation: ValidationResult = {
        isValid: false,
        errors: ['Invalid rune ID'],
      };
      mockValidator.validateRuneId.mockResolvedValueOnce(mockRuneValidation);

      await expect(service.getRuneBalance(runeId, address)).rejects.toThrow('Invalid rune ID');
    });

    it('should throw error on invalid address', async () => {
      const mockRuneValidation: ValidationResult = { isValid: true, errors: [] };
      const mockAddressValidation: ValidationResult = {
        isValid: false,
        errors: ['Invalid address'],
      };

      mockValidator.validateRuneId.mockResolvedValueOnce(mockRuneValidation);
      mockValidator.validateAddress.mockResolvedValueOnce(mockAddressValidation);

      await expect(service.getRuneBalance(runeId, address)).rejects.toThrow('Invalid address');
    });
  });
});
