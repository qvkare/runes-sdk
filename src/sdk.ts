import { RpcClient } from './types/rpc.types';
import { Logger } from './types/logger.types';
import { SdkConfig } from './types/sdk.types';
import { RpcUtils } from './utils/rpc.utils';

export class RunesSDK {
  private readonly rpcClient: RpcClient;
  private readonly logger: Logger;

  constructor(config: SdkConfig) {
    this.rpcClient = new RpcUtils(config.rpcUrl, config.rpcUsername, config.rpcPassword);
    this.logger = config.logger || console;
  }

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
}
