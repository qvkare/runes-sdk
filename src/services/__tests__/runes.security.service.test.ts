import { RunesSecurityService } from '../runes.security.service';
import { RPCClient } from '../../utils/rpc.client';
import { Logger } from '../../utils/logger';
import { createMockLogger } from '../../utils/test.utils';

jest.mock('../../utils/rpc.client');
jest.mock('../../utils/logger');

describe('RunesSecurityService', () => {
  let securityService: RunesSecurityService;
  let mockRpcClient: jest.Mocked<RPCClient>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockRpcClient = new RPCClient('url', 'user', 'pass', undefined) as jest.Mocked<RPCClient>;
    mockLogger = createMockLogger() as jest.Mocked<Logger>;
    securityService = new RunesSecurityService(mockRpcClient, mockLogger);
    jest.clearAllMocks();
  });

  describe('verifyTransaction', () => {
    const txId = 'tx123';

    it('should verify transaction successfully', async () => {
      const mockResponse = {
        isValid: true,
        signatures: ['sig1', 'sig2'],
        timestamp: 1234567890,
        reason: 'Valid transaction'
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      const result = await securityService.verifyTransaction(txId);
      expect(result).toEqual({
        txId,
        ...mockResponse
      });
      expect(mockRpcClient.call).toHaveBeenCalledWith('verifytransaction', [txId]);
    });

    it('should handle missing txId', async () => {
      await expect(securityService.verifyTransaction(''))
        .rejects
        .toThrow('Failed to verify transaction: Transaction ID is required');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to verify transaction: Transaction ID is required');
    });

    it('should handle invalid RPC response', async () => {
      mockRpcClient.call.mockResolvedValueOnce(null);

      await expect(securityService.verifyTransaction(txId))
        .rejects
        .toThrow('Failed to verify transaction: Invalid response from RPC');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to verify transaction: Invalid response from RPC');
    });

    it('should handle invalid isValid type', async () => {
      const mockResponse = {
        isValid: 'true',
        signatures: ['sig1', 'sig2'],
        timestamp: 1234567890,
        reason: 'Valid transaction'
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      await expect(securityService.verifyTransaction(txId))
        .rejects
        .toThrow('Failed to verify transaction: Invalid response from RPC');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to verify transaction: Invalid response from RPC');
    });

    it('should handle missing isValid field', async () => {
      const mockResponse = {
        signatures: ['sig1', 'sig2'],
        timestamp: 1234567890,
        reason: 'Valid transaction'
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      await expect(securityService.verifyTransaction(txId))
        .rejects
        .toThrow('Failed to verify transaction: Invalid response from RPC');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to verify transaction: Invalid response from RPC');
    });

    it('should handle missing signatures', async () => {
      const mockResponse = {
        isValid: true,
        timestamp: 1234567890
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      const result = await securityService.verifyTransaction(txId);
      expect(result.signatures).toEqual([]);
    });

    it('should handle RPC error', async () => {
      const error = new Error('Network error');
      mockRpcClient.call.mockRejectedValueOnce(error);

      await expect(securityService.verifyTransaction(txId))
        .rejects
        .toThrow('Failed to verify transaction: Network error');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to verify transaction: Network error');
    });

    it('should handle unknown RPC error', async () => {
      mockRpcClient.call.mockRejectedValueOnce('Unknown error');

      await expect(securityService.verifyTransaction(txId))
        .rejects
        .toThrow('Failed to verify transaction: Unknown error');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to verify transaction: Unknown error');
    });
  });

  describe('checkRuneSecurity', () => {
    const runeId = 'rune123';

    it('should check security successfully', async () => {
      const mockResponse = {
        runeId: 'rune123',
        isSecure: true,
        vulnerabilities: ['vuln1', 'vuln2'],
        lastAudit: 1234567890
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      const result = await securityService.checkRuneSecurity(runeId);
      expect(result).toEqual(mockResponse);
      expect(mockRpcClient.call).toHaveBeenCalledWith('checkrunesecurity', [runeId]);
    });

    it('should handle missing runeId', async () => {
      await expect(securityService.checkRuneSecurity(''))
        .rejects
        .toThrow('Failed to check rune security: Rune ID is required');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to check rune security: Rune ID is required');
    });

    it('should handle invalid RPC response', async () => {
      mockRpcClient.call.mockResolvedValueOnce(null);

      await expect(securityService.checkRuneSecurity(runeId))
        .rejects
        .toThrow('Failed to check rune security: Invalid response from RPC');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to check rune security: Invalid response from RPC');
    });

    it('should handle invalid isSecure type', async () => {
      const mockResponse = {
        runeId: 'rune123',
        isSecure: 'true',
        vulnerabilities: ['vuln1', 'vuln2'],
        lastAudit: 1234567890
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      await expect(securityService.checkRuneSecurity(runeId))
        .rejects
        .toThrow('Failed to check rune security: Invalid response from RPC');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to check rune security: Invalid response from RPC');
    });

    it('should handle missing isSecure field', async () => {
      const mockResponse = {
        runeId: 'rune123',
        vulnerabilities: ['vuln1', 'vuln2'],
        lastAudit: 1234567890
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      await expect(securityService.checkRuneSecurity(runeId))
        .rejects
        .toThrow('Failed to check rune security: Invalid response from RPC');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to check rune security: Invalid response from RPC');
    });

    it('should handle missing vulnerabilities', async () => {
      const mockResponse = {
        runeId: 'rune123',
        isSecure: true,
        lastAudit: 1234567890
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      const result = await securityService.checkRuneSecurity(runeId);
      expect(result.vulnerabilities).toEqual([]);
    });

    it('should handle RPC error', async () => {
      const error = new Error('Network error');
      mockRpcClient.call.mockRejectedValueOnce(error);

      await expect(securityService.checkRuneSecurity(runeId))
        .rejects
        .toThrow('Failed to check rune security: Network error');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to check rune security: Network error');
    });

    it('should handle unknown RPC error', async () => {
      mockRpcClient.call.mockRejectedValueOnce('Unknown error');

      await expect(securityService.checkRuneSecurity(runeId))
        .rejects
        .toThrow('Failed to check rune security: Unknown error');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to check rune security: Unknown error');
    });
  });
}); 