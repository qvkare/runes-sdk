import { RunesValidator } from '../runes.validator';
import { RPCClient } from '../rpc.client';
import { jest } from '@jest/globals';

jest.mock('../rpc.client');

describe('RunesValidator', () => {
  let validator: RunesValidator;
  let mockRpcClient: jest.Mocked<RPCClient>;

  beforeEach(() => {
    mockRpcClient = new RPCClient({
      baseUrl: 'http://localhost:8332',
    }) as jest.Mocked<RPCClient>;
    validator = new RunesValidator(mockRpcClient);
  });

  describe('validateTransfer', () => {
    it('should validate a valid transfer', async () => {
      const mockResponse = {
        isValid: true,
        errors: [],
      };

      mockRpcClient.call.mockResolvedValue(mockResponse);

      const transfer = {
        runesId: 'rune1',
        from: 'addr1',
        to: 'addr2',
        amount: BigInt(1000),
      };

      const result = await validator.validateTransfer(transfer);

      expect(result).toEqual(mockResponse);
      expect(mockRpcClient.call).toHaveBeenCalledWith('validatetransfer', [transfer]);
    });

    it('should handle validation errors', async () => {
      const mockResponse = {
        isValid: false,
        errors: ['Invalid amount', 'Invalid address'],
      };

      mockRpcClient.call.mockResolvedValue(mockResponse);

      const transfer = {
        runesId: 'rune1',
        from: 'invalid',
        to: 'addr2',
        amount: BigInt(0),
      };

      const result = await validator.validateTransfer(transfer);

      expect(result).toEqual(mockResponse);
      expect(mockRpcClient.call).toHaveBeenCalledWith('validatetransfer', [transfer]);
    });

    it('should handle RPC errors', async () => {
      mockRpcClient.call.mockRejectedValue(new Error('Failed to validate transfer'));

      const transfer = {
        runesId: 'rune1',
        from: 'addr1',
        to: 'addr2',
        amount: BigInt(1000),
      };

      await expect(validator.validateTransfer(transfer)).rejects.toThrow('Failed to validate transfer');
    });
  });

  describe('validateAddress', () => {
    it('should validate a valid address', async () => {
      const mockResponse = {
        isValid: true,
        errors: [],
      };

      mockRpcClient.call.mockResolvedValue(mockResponse);

      const result = await validator.validateAddress('addr1');

      expect(result).toEqual(mockResponse);
      expect(mockRpcClient.call).toHaveBeenCalledWith('validateaddress', ['addr1']);
    });

    it('should handle invalid address', async () => {
      const mockResponse = {
        isValid: false,
        errors: ['Invalid address format'],
      };

      mockRpcClient.call.mockResolvedValue(mockResponse);

      const result = await validator.validateAddress('invalid');

      expect(result).toEqual(mockResponse);
      expect(mockRpcClient.call).toHaveBeenCalledWith('validateaddress', ['invalid']);
    });

    it('should handle RPC errors', async () => {
      mockRpcClient.call.mockRejectedValue(new Error('Failed to validate address'));

      await expect(validator.validateAddress('addr1')).rejects.toThrow('Failed to validate address');
    });
  });
}); 