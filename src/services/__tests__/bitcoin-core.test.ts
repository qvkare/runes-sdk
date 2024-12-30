import { BitcoinCoreService } from '../bitcoin-core';
import { createMockLogger, createMockRpcClient } from '../../utils/__tests__/test.utils';

describe('BitcoinCoreService', () => {
  let service: BitcoinCoreService;
  let mockRpcClient: any;
  let mockLogger: any;

  beforeEach(() => {
    mockLogger = createMockLogger();
    mockRpcClient = createMockRpcClient();
    service = new BitcoinCoreService(mockRpcClient, mockLogger);
  });

  describe('getBlockCount', () => {
    it('should get block count successfully', async () => {
      mockRpcClient.call.mockResolvedValueOnce(100);
      const result = await service.getBlockCount();
      expect(result).toBe(100);
    });

    it('should handle RPC error', async () => {
      mockRpcClient.call.mockRejectedValueOnce(new Error('RPC error'));
      await expect(service.getBlockCount()).rejects.toThrow('Failed to get block count');
    });
  });

  describe('getMemPoolInfo', () => {
    it('should get mempool info successfully', async () => {
      const mockInfo = {
        size: 100,
        bytes: 10000,
        usage: 5000,
      };
      mockRpcClient.call.mockResolvedValueOnce(mockInfo);
      const result = await service.getMemPoolInfo();
      expect(result).toEqual(mockInfo);
    });

    it('should handle RPC error', async () => {
      mockRpcClient.call.mockRejectedValueOnce(new Error('RPC error'));
      await expect(service.getMemPoolInfo()).rejects.toThrow('Failed to get mempool info');
    });
  });

  describe('validateAddress', () => {
    it('should validate address successfully', async () => {
      mockRpcClient.call.mockResolvedValueOnce({ isvalid: true });
      const result = await service.validateAddress('bc1...');
      expect(result.isvalid).toBe(true);
    });

    it('should handle RPC error', async () => {
      mockRpcClient.call.mockRejectedValueOnce(new Error('RPC error'));
      await expect(service.validateAddress('bc1...')).rejects.toThrow('Failed to validate address');
    });
  });

  describe('getRawTransaction', () => {
    it('should get raw transaction successfully', async () => {
      const mockTx = {
        txid: 'tx1',
        version: 1,
        vin: [],
        vout: [],
      };
      mockRpcClient.call.mockResolvedValueOnce(mockTx);
      const result = await service.getRawTransaction('tx1');
      expect(result).toEqual(mockTx);
    });

    it('should handle RPC error', async () => {
      mockRpcClient.call.mockRejectedValueOnce(new Error('RPC error'));
      await expect(service.getRawTransaction('tx1')).rejects.toThrow(
        'Failed to get raw transaction'
      );
    });
  });

  describe('decodeRawTransaction', () => {
    it('should decode raw transaction successfully', async () => {
      const mockTx = {
        txid: 'tx1',
        version: 1,
        vin: [],
        vout: [],
      };
      mockRpcClient.call.mockResolvedValueOnce(mockTx);
      const result = await service.decodeRawTransaction('hex1');
      expect(result).toEqual(mockTx);
    });

    it('should handle RPC error', async () => {
      mockRpcClient.call.mockRejectedValueOnce(new Error('RPC error'));
      await expect(service.decodeRawTransaction('hex1')).rejects.toThrow(
        'Failed to decode transaction'
      );
    });
  });

  describe('sendRawTransaction', () => {
    it('should send raw transaction successfully', async () => {
      mockRpcClient.call.mockResolvedValueOnce('txid1');
      const result = await service.sendRawTransaction('hex1');
      expect(result).toBe('txid1');
    });

    it('should handle RPC error', async () => {
      mockRpcClient.call.mockRejectedValueOnce(new Error('RPC error'));
      await expect(service.sendRawTransaction('hex1')).rejects.toThrow(
        'Failed to send transaction'
      );
    });
  });

  describe('listUnspent', () => {
    it('should list unspent outputs successfully', async () => {
      const mockUtxos = [
        { txid: 'tx1', vout: 0, amount: 1.0 },
        { txid: 'tx2', vout: 1, amount: 2.0 },
      ];
      mockRpcClient.call.mockResolvedValueOnce(mockUtxos);
      const result = await service.listUnspent();
      expect(result).toEqual(mockUtxos);
    });

    it('should handle RPC error', async () => {
      mockRpcClient.call.mockRejectedValueOnce(new Error('RPC error'));
      await expect(service.listUnspent()).rejects.toThrow('Failed to list unspent outputs');
    });
  });
});
