import { RpcClient } from '../../utils/rpc.client';
import { Logger } from '../../types/logger.types';

export class RunesSecurityService {
  constructor(
    private readonly rpcClient: RpcClient,
    private readonly logger: Logger
  ) {}

  async verifyTransaction(txId: string): Promise<any> {
    try {
      const response = await this.rpcClient.call('verifytransaction', [txId]);
      return {
        txId,
        ...response,
      };
    } catch (error) {
      this.logger.error(`Failed to verify transaction: ${error}`);
      throw new Error(`Failed to verify transaction: ${error}`);
    }
  }

  async checkRuneSecurity(runeId: string): Promise<any> {
    try {
      return await this.rpcClient.call('checkrunesecurity', [runeId]);
    } catch (error) {
      this.logger.error(`Failed to check rune security: ${error}`);
      throw new Error(`Failed to check rune security: ${error}`);
    }
  }
}
