import { RunesSecurityService } from '../runes.security.service';
import { RPCClient } from '../../utils/rpc.client';
import { Logger } from '../../utils/logger';
import { createMockLogger, createMockRpcClient } from '../../utils/__tests__/test.utils';

describe('RunesSecurityService', () => {
  let securityService: RunesSecurityService;
  let mockRpcClient: jest.Mocked<RPCClient>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockLogger = createMockLogger('RunesSecurityService');
    mockRpcClient = createMockRpcClient(mockLogger);
    securityService = new RunesSecurityService(mockRpcClient, mockLogger);
  });

  describe('verifyRune', () => {
    const runeId = 'rune123';

    it('should verify rune successfully', async () => {
      const mockResponse = {
        result: {
          verified: true
        }
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      const result = await securityService.verifyRune(runeId);
      expect(result).toBe(true);
      expect(mockRpcClient.call).toHaveBeenCalledWith('verifyrune', [runeId]);
    });

    it('should handle unverified rune', async () => {
      const mockResponse = {
        result: {
          verified: false
        }
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      const result = await securityService.verifyRune(runeId);
      expect(result).toBe(false);
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should handle RPC errors', async () => {
      mockRpcClient.call.mockRejectedValueOnce(new Error('RPC error'));

      await expect(securityService.verifyRune(runeId)).rejects.toThrow('Failed to verify rune');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle invalid RPC response', async () => {
      mockRpcClient.call.mockResolvedValueOnce({ result: null });

      await expect(securityService.verifyRune(runeId)).rejects.toThrow('Invalid response from RPC');
      expect(mockLogger.error).toHaveBeenCalledWith('Invalid response from RPC');
    });
  });

  describe('checkSecurity', () => {
    const runeId = 'rune123';

    it('should check security successfully', async () => {
      const mockResponse = {
        result: {
          secure: true,
          issues: []
        }
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      const result = await securityService.checkSecurity(runeId);
      expect(result).toEqual(mockResponse.result);
      expect(mockRpcClient.call).toHaveBeenCalledWith('checksecurity', [runeId]);
    });

    it('should handle security issues', async () => {
      const mockResponse = {
        result: {
          secure: false,
          issues: ['Potential vulnerability found']
        }
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      const result = await securityService.checkSecurity(runeId);
      expect(result).toEqual(mockResponse.result);
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should handle RPC errors', async () => {
      mockRpcClient.call.mockRejectedValueOnce(new Error('RPC error'));

      await expect(securityService.checkSecurity(runeId)).rejects.toThrow('Failed to check security');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle invalid RPC response', async () => {
      mockRpcClient.call.mockResolvedValueOnce({ result: null });

      await expect(securityService.checkSecurity(runeId)).rejects.toThrow('Invalid response from RPC');
      expect(mockLogger.error).toHaveBeenCalledWith('Invalid response from RPC');
    });
  });
}); 