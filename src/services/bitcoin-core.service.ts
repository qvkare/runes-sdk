import { RPCClient } from '../utils/rpc.client';
import { RPCClientConfig } from '../types';
import { Logger } from '../utils/logger';

export class BitcoinCoreService {
  private readonly rpcClient: RPCClient;
  private readonly logger: Logger;

  constructor(config: RPCClientConfig, logger: Logger) {
    this.rpcClient = new RPCClient(config);
    this.logger = logger;
  }

  async getBlockCount(): Promise<number> {
    return this.rpcClient.call('getblockcount');
  }

  async getMemPoolInfo(): Promise<any> {
    return this.rpcClient.call('getmempoolinfo');
  }

  async getRawTransaction(txid: string): Promise<any> {
    return this.rpcClient.call('getrawtransaction', [txid, true]);
  }

  async decodeRawTransaction(hexstring: string): Promise<any> {
    return this.rpcClient.call('decoderawtransaction', [hexstring]);
  }

  async sendRawTransaction(hexstring: string): Promise<string> {
    return this.rpcClient.call('sendrawtransaction', [hexstring]);
  }

  async listUnspent(minconf = 1, maxconf = 9999999, addresses: string[] = []): Promise<any[]> {
    return this.rpcClient.call('listunspent', [minconf, maxconf, addresses]);
  }

  async validateAddress(address: string): Promise<boolean> {
    try {
      const result = await this.rpcClient.call('validateaddress', [address]);
      return result.isvalid === true;
    } catch (error) {
      this.logger.error('Error validating address:', error);
      return false;
    }
  }

  async createRawTransaction(inputs: any[], outputs: any): Promise<string> {
    return this.rpcClient.call('createrawtransaction', [inputs, outputs]);
  }

  async signRawTransaction(hexstring: string): Promise<{ hex: string; complete: boolean }> {
    return this.rpcClient.call('signrawtransactionwithwallet', [hexstring]);
  }
}
