import { RpcClient } from '../../../types/rpc.types';
import { Logger } from '../../../types/logger.types';
import { RunePermissions } from '../../../types/rune.types';

export class RunesSecurityService {
  constructor(
    private readonly rpcClient: RpcClient,
    private readonly logger: Logger
  ) {}

  async validateTransaction(txid: string): Promise<boolean> {
    try {
      const result = await this.rpcClient.validateTransaction(txid);
      this.logger.info('Transaction validated successfully:', txid);
      return result;
    } catch (error) {
      this.logger.error('Error validating transaction:', error);
      throw error;
    }
  }

  async validateRuneAccess(runeId: string, address: string, action: string): Promise<boolean> {
    try {
      const result = await this.rpcClient.call('validateruneaccess', [runeId, address, action]);
      return result;
    } catch (error) {
      this.logger.error('Failed to validate rune access:', error);
      throw new Error('Failed to validate rune access');
    }
  }

  async getRunePermissions(runeId: string): Promise<RunePermissions> {
    try {
      const result = await this.rpcClient.call('getrunepermissions', [runeId]);
      return result;
    } catch (error) {
      this.logger.error('Failed to get rune permissions:', error);
      throw new Error('Failed to get rune permissions');
    }
  }

  async updateRunePermissions(runeId: string, permissions: RunePermissions): Promise<boolean> {
    try {
      const result = await this.rpcClient.call('updaterunepermissions', [runeId, permissions]);
      return result;
    } catch (error) {
      this.logger.error('Failed to update rune permissions:', error);
      throw new Error('Failed to update rune permissions');
    }
  }
}
