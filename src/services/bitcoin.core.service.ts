import { RPCClient } from '../utils/rpc.client';
import { Logger } from '../utils/logger';

export class BitcoinCoreService {
  constructor(
    private readonly rpcClient: RPCClient,
    private readonly logger: Logger
  ) {}

  async getBlockCount(): Promise<number> {
    try {
      const blockCount = await this.rpcClient.call('getblockcount');
      return blockCount;
    } catch (error) {
      this.logger.error('Failed to get block count:', error);
      throw error;
    }
  }

  async getMemPoolInfo(): Promise<any> {
    try {
      const memPoolInfo = await this.rpcClient.call('getmempoolinfo');
      return memPoolInfo;
    } catch (error) {
      this.logger.error('Failed to get mempool info:', error);
      throw error;
    }
  }

  async getRawTransaction(txid: string): Promise<any> {
    try {
      const rawTx = await this.rpcClient.call('getrawtransaction', [txid]);
      return rawTx;
    } catch (error) {
      this.logger.error('Failed to get raw transaction:', error);
      throw error;
    }
  }

  async decodeRawTransaction(rawTx: string): Promise<any> {
    try {
      const decodedTx = await this.rpcClient.call('decoderawtransaction', [rawTx]);
      return decodedTx;
    } catch (error) {
      this.logger.error('Failed to decode raw transaction:', error);
      throw error;
    }
  }

  async sendRawTransaction(rawTx: string): Promise<string> {
    try {
      const txid = await this.rpcClient.call('sendrawtransaction', [rawTx]);
      return txid;
    } catch (error) {
      this.logger.error('Failed to send raw transaction:', error);
      throw error;
    }
  }

  async listUnspent(addresses: string[]): Promise<any[]> {
    try {
      const unspent = await this.rpcClient.call('listunspent', [1, 9999999, addresses]);
      return unspent;
    } catch (error) {
      this.logger.error('Failed to list unspent:', error);
      throw error;
    }
  }

  async validateAddress(address: string): Promise<boolean> {
    try {
      const validation = await this.rpcClient.call('validateaddress', [address]);
      return validation.isvalid;
    } catch (error) {
      this.logger.error('Failed to validate address:', error);
      throw error;
    }
  }

  async createRawTransaction(inputs: any[], outputs: any): Promise<string> {
    try {
      const rawTx = await this.rpcClient.call('createrawtransaction', [inputs, outputs]);
      return rawTx;
    } catch (error) {
      this.logger.error('Failed to create raw transaction:', error);
      throw error;
    }
  }

  async signRawTransaction(rawTx: string): Promise<{ hex: string; complete: boolean }> {
    try {
      const signedTx = await this.rpcClient.call('signrawtransactionwithwallet', [rawTx]);
      return signedTx;
    } catch (error) {
      this.logger.error('Failed to sign raw transaction:', error);
      throw error;
    }
  }
} 