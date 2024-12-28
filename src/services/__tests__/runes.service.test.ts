import { RunesService } from '../runes.service';
import { RPCClient } from '../../utils/rpc.client';
import { RunesValidator } from '../../utils/runes.validator';

jest.mock('../../utils/rpc.client');
jest.mock('../../utils/runes.validator');

describe('RunesService', () => {
  let runesService: RunesService;
  let mockRpcClient: jest.Mocked<RPCClient>;
  let mockValidator: jest.Mocked<RunesValidator>;

  beforeEach(() => {
    mockRpcClient = {
      call: jest.fn(),
      baseUrl: 'http://localhost:8332',
      auth: { username: 'test', password: 'test' },
      timeout: 5000,
      maxRetries: 3,
      retryDelay: 1000,
      network: 'regtest',
      handleError: jest.fn(),
      handleResponse: jest.fn(),
      buildRequestOptions: jest.fn(),
      buildAuthHeader: jest.fn(),
      buildUrl: jest.fn()
    } as unknown as jest.Mocked<RPCClient>;

    mockValidator = {
      validateTransfer: jest.fn()
    } as unknown as jest.Mocked<RunesValidator>;

    runesService = new RunesService(mockRpcClient);
    runesService['validator'] = mockValidator;
  });

  describe('createTransfer', () => {
    const params = {
      from: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      to: '12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX',
      amount: BigInt(1000)
    };

    it('should create transfer successfully', async () => {
      const mockTxid = 'mock-txid';
      mockValidator.validateTransfer.mockResolvedValue({ isValid: true, errors: [] });
      mockRpcClient.call.mockResolvedValue({ txid: mockTxid });

      const result = await runesService.createTransfer(
        params.from,
        params.to,
        params.amount
      );

      expect(result).toBe(mockTxid);
      expect(mockValidator.validateTransfer).toHaveBeenCalledWith(
        params.from,
        params.to,
        params.amount
      );
      expect(mockRpcClient.call).toHaveBeenCalledWith(
        'createtransfer',
        [params.from, params.to, params.amount.toString()]
      );
    });

    it('should throw error when validation fails', async () => {
      mockValidator.validateTransfer.mockResolvedValue({
        isValid: false,
        errors: ['Invalid address']
      });

      await expect(runesService.createTransfer(
        params.from,
        params.to,
        params.amount
      )).rejects.toThrow('Runes transfer validation failed');

      expect(mockValidator.validateTransfer).toHaveBeenCalledWith(
        params.from,
        params.to,
        params.amount
      );
      expect(mockRpcClient.call).not.toHaveBeenCalled();
    });

    it('should throw error when RPC call fails', async () => {
      mockValidator.validateTransfer.mockResolvedValue({ isValid: true, errors: [] });
      mockRpcClient.call.mockResolvedValue(null);

      await expect(runesService.createTransfer(
        params.from,
        params.to,
        params.amount
      )).rejects.toThrow('Failed to create transfer');

      expect(mockValidator.validateTransfer).toHaveBeenCalledWith(
        params.from,
        params.to,
        params.amount
      );
      expect(mockRpcClient.call).toHaveBeenCalledWith(
        'createtransfer',
        [params.from, params.to, params.amount.toString()]
      );
    });
  });

  describe('getTransferStatus', () => {
    const txid = 'mock-txid';

    it('should get transfer status successfully', async () => {
      const mockStatus = 'confirmed';
      mockRpcClient.call.mockResolvedValue({ status: mockStatus });

      const result = await runesService.getTransferStatus(txid);

      expect(result).toBe(mockStatus);
      expect(mockRpcClient.call).toHaveBeenCalledWith('gettransferstatus', [txid]);
    });

    it('should throw error when RPC call fails', async () => {
      mockRpcClient.call.mockRejectedValue(new Error('RPC error'));

      await expect(runesService.getTransferStatus(txid))
        .rejects.toThrow('RPC error');

      expect(mockRpcClient.call).toHaveBeenCalledWith('gettransferstatus', [txid]);
    });
  });
}); 