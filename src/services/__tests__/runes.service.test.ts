import { RunesService } from '../runes.service';
import { createMockLogger, createMockRpcClient, createMockValidator } from '../../utils/test.utils';
import { RuneTransfer } from '../../types/rune.types';

describe('RunesService', () => {
  let service: RunesService;
  let mockRpcClient: any;
  let mockLogger: any;
  let mockValidator: any;

  beforeEach(() => {
    mockRpcClient = createMockRpcClient();
    mockLogger = createMockLogger();
    mockValidator = createMockValidator();
    service = new RunesService(mockRpcClient, mockLogger, mockValidator);
  });

  describe('transferRune', () => {
    const validTransfer: RuneTransfer = {
      from: 'addr1',
      to: 'addr2',
      amount: '100',
      symbol: 'RUNE'
    };

    it('should transfer rune successfully', async () => {
      const mockResponse = {
        txid: 'tx123',
        ...validTransfer
      };

      mockValidator.validateTransfer.mockReturnValue({ isValid: true, errors: [] });
      mockRpcClient.call.mockResolvedValue(mockResponse);

      const result = await service.transferRune(validTransfer);
      expect(result).toEqual(mockResponse);
      expect(mockValidator.validateTransfer).toHaveBeenCalledWith(validTransfer);
      expect(mockRpcClient.call).toHaveBeenCalledWith('transfer', [validTransfer]);
    });

    it('should handle validation errors', async () => {
      mockValidator.validateTransfer.mockReturnValue({
        isValid: false,
        errors: ['Invalid transfer']
      });

      await expect(service.transferRune(validTransfer))
        .rejects
        .toThrow('Invalid transfer');
      expect(mockValidator.validateTransfer).toHaveBeenCalled();
      expect(mockRpcClient.call).not.toHaveBeenCalled();
    });

    it('should handle RPC errors', async () => {
      mockValidator.validateTransfer.mockReturnValue({ isValid: true, errors: [] });
      mockRpcClient.call.mockRejectedValue(new Error('RPC error'));

      await expect(service.transferRune(validTransfer))
        .rejects
        .toThrow('Failed to transfer rune: RPC error');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle unknown errors', async () => {
      mockValidator.validateTransfer.mockReturnValue({ isValid: true, errors: [] });
      mockRpcClient.call.mockRejectedValue('Unknown error');

      await expect(service.transferRune(validTransfer))
        .rejects
        .toThrow('Failed to transfer rune: Unknown error');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
}); 