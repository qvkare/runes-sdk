import { RPCClient } from '../../utils/rpc.client';
import { RuneService } from '../rune.service';
import { RuneValidationResult } from '../../types/validation.types';
import { jest } from '@jest/globals';

jest.mock('../../utils/rpc.client');

describe('RuneService', () => {
  let runeService: RuneService;
  let rpcClient: jest.Mocked<RPCClient>;

  beforeEach(() => {
    rpcClient = {
      call: jest.fn().mockImplementation(async () => ({})),
      baseUrl: '',
      auth: '',
      timeout: 0,
      maxRetries: 0,
      retryDelay: 0,
      debug: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn()
    } as unknown as jest.Mocked<RPCClient>;
    runeService = new RuneService(rpcClient);
  });

  describe('validateTransfer', () => {
    it('should validate transfer successfully', async () => {
      const params = {
        from: 'address1',
        to: 'address2',
        amount: BigInt(100)
      };

      const validationResult: RuneValidationResult = {
        isValid: true,
        errors: []
      };

      jest.spyOn(runeService['validator'], 'validateTransfer')
        .mockResolvedValue(validationResult);

      const result = await runeService.validateTransfer(
        params.from,
        params.to,
        params.amount
      );

      expect(result).toEqual(validationResult);
      expect(runeService['validator'].validateTransfer).toHaveBeenCalledWith(
        params.from,
        params.to,
        params.amount
      );
    });

    it('should return validation errors', async () => {
      const params = {
        from: 'invalid',
        to: 'invalid',
        amount: BigInt(0)
      };

      const validationResult: RuneValidationResult = {
        isValid: false,
        errors: ['Invalid addresses']
      };

      jest.spyOn(runeService['validator'], 'validateTransfer')
        .mockResolvedValue(validationResult);

      const result = await runeService.validateTransfer(
        params.from,
        params.to,
        params.amount
      );

      expect(result).toEqual(validationResult);
      expect(runeService['validator'].validateTransfer).toHaveBeenCalledWith(
        params.from,
        params.to,
        params.amount
      );
    });
  });

  describe('createTransfer', () => {
    it('should create transfer successfully', async () => {
      const params = {
        from: 'address1',
        to: 'address2',
        amount: BigInt(100)
      };

      const validationResult: RuneValidationResult = {
        isValid: true,
        errors: []
      };

      jest.spyOn(runeService['validator'], 'validateTransfer')
        .mockResolvedValue(validationResult);
      rpcClient.call.mockResolvedValue({ txid: 'test-txid' });

      const txid = await runeService.createTransfer(
        params.from,
        params.to,
        params.amount
      );

      expect(txid).toBe('test-txid');
      expect(runeService['validator'].validateTransfer).toHaveBeenCalledWith(
        params.from,
        params.to,
        params.amount
      );
      expect(rpcClient.call).toHaveBeenCalledWith('createtransfer', [
        params.from,
        params.to,
        params.amount.toString()
      ]);
    });

    it('should throw error when validation fails', async () => {
      const params = {
        from: 'invalid',
        to: 'invalid',
        amount: BigInt(0)
      };

      const validationResult: RuneValidationResult = {
        isValid: false,
        errors: ['Invalid addresses']
      };

      jest.spyOn(runeService['validator'], 'validateTransfer')
        .mockResolvedValue(validationResult);

      await expect(runeService.createTransfer(
        params.from,
        params.to,
        params.amount
      )).rejects.toThrow('Rune transfer validation failed');

      expect(runeService['validator'].validateTransfer).toHaveBeenCalledWith(
        params.from,
        params.to,
        params.amount
      );
      expect(rpcClient.call).not.toHaveBeenCalled();
    });

    it('should throw error when RPC call fails', async () => {
      const params = {
        from: 'address1',
        to: 'address2',
        amount: BigInt(100)
      };

      const validationResult: RuneValidationResult = {
        isValid: true,
        errors: []
      };

      jest.spyOn(runeService['validator'], 'validateTransfer')
        .mockResolvedValue(validationResult);
      rpcClient.call.mockResolvedValue(null);

      await expect(runeService.createTransfer(
        params.from,
        params.to,
        params.amount
      )).rejects.toThrow('Failed to create transfer');

      expect(runeService['validator'].validateTransfer).toHaveBeenCalledWith(
        params.from,
        params.to,
        params.amount
      );
      expect(rpcClient.call).toHaveBeenCalledWith('createtransfer', [
        params.from,
        params.to,
        params.amount.toString()
      ]);
    });
  });

  describe('getTransferStatus', () => {
    it('should get transfer status successfully', async () => {
      const txid = 'test-txid';
      const status = 'confirmed';

      rpcClient.call.mockResolvedValue({ status });

      const result = await runeService.getTransferStatus(txid);

      expect(result).toBe(status);
      expect(rpcClient.call).toHaveBeenCalledWith('gettransferstatus', [txid]);
    });

    it('should throw error when RPC call fails', async () => {
      const txid = 'test-txid';

      rpcClient.call.mockRejectedValue(new Error('RPC error'));

      await expect(runeService.getTransferStatus(txid))
        .rejects.toThrow('RPC error');

      expect(rpcClient.call).toHaveBeenCalledWith('gettransferstatus', [txid]);
    });
  });
}); 