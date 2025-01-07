import { jest } from '@jest/globals';
import { RunesSecurityService } from '../service';
import { createMockLogger, createMockRpcClient } from '../../../../utils/test.utils';
import { RunePermissions } from '../../../../types/rune.types';

describe('RunesSecurityService', () => {
  let service: RunesSecurityService;
  let mockRpcClient: jest.Mocked<any>;
  let mockLogger: jest.Mocked<any>;

  beforeEach(() => {
    mockRpcClient = createMockRpcClient();
    mockLogger = createMockLogger();
    service = new RunesSecurityService(mockRpcClient, mockLogger);
  });

  describe('validateRuneAccess', () => {
    it('should validate rune access successfully', async () => {
      const runeId = 'rune1';
      const address = 'addr1';
      const action = 'mint';

      mockRpcClient.call.mockResolvedValue(true);

      const result = await service.validateRuneAccess(runeId, address, action);
      expect(result).toBe(true);
      expect(mockRpcClient.call).toHaveBeenCalledWith('validateruneaccess', [
        runeId,
        address,
        action,
      ]);
    });

    it('should handle validation error', async () => {
      const runeId = 'rune1';
      const address = 'addr1';
      const action = 'mint';

      mockRpcClient.call.mockRejectedValue(new Error('Access denied'));

      await expect(service.validateRuneAccess(runeId, address, action)).rejects.toThrow(
        'Failed to validate rune access'
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to validate rune access:',
        expect.any(Error)
      );
    });
  });

  describe('getRunePermissions', () => {
    it('should get rune permissions successfully', async () => {
      const runeId = 'rune1';
      const mockPermissions: RunePermissions = {
        runeId: 'rune1',
        canMint: true,
        canBurn: true,
        canTransfer: true,
        canModifyPermissions: true,
      };

      mockRpcClient.call.mockResolvedValue(mockPermissions);

      const result = await service.getRunePermissions(runeId);
      expect(result).toEqual(mockPermissions);
      expect(mockRpcClient.call).toHaveBeenCalledWith('getrunepermissions', [runeId]);
    });

    it('should handle error when getting permissions', async () => {
      const runeId = 'rune1';

      mockRpcClient.call.mockRejectedValue(new Error('Failed to get permissions'));

      await expect(service.getRunePermissions(runeId)).rejects.toThrow(
        'Failed to get rune permissions'
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to get rune permissions:',
        expect.any(Error)
      );
    });
  });

  describe('updateRunePermissions', () => {
    it('should update rune permissions successfully', async () => {
      const runeId = 'rune1';
      const permissions: RunePermissions = {
        runeId: 'rune1',
        canMint: true,
        canBurn: true,
        canTransfer: true,
        canModifyPermissions: true,
      };

      mockRpcClient.call.mockResolvedValue(true);

      const result = await service.updateRunePermissions(runeId, permissions);
      expect(result).toBe(true);
      expect(mockRpcClient.call).toHaveBeenCalledWith('updaterunepermissions', [
        runeId,
        permissions,
      ]);
    });

    it('should handle error when updating permissions', async () => {
      const runeId = 'rune1';
      const permissions: RunePermissions = {
        runeId: 'rune1',
        canMint: true,
        canBurn: true,
        canTransfer: true,
        canModifyPermissions: true,
      };

      mockRpcClient.call.mockRejectedValue(new Error('Failed to update permissions'));

      await expect(service.updateRunePermissions(runeId, permissions)).rejects.toThrow(
        'Failed to update rune permissions'
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to update rune permissions:',
        expect.any(Error)
      );
    });
  });
});
