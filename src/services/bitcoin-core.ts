import { RPCClient } from '../utils/rpc.client';
import { Logger } from '../types';
import { RunesError } from '../utils/errors';

export class BitcoinCoreService {
  constructor(
    private readonly rpcClient: RPCClient,
    private readonly logger: Logger
  ) {}

  async getBlockCount(): Promise<number> {
    try {
      return await this.rpcClient.call('getblockcount');
    } catch (error) {
      this.logger.error('Failed to get block count:', error);
      throw new RunesError('Failed to get block count', 'BLOCK_COUNT_ERROR');
    }
  }

  async getMemPoolInfo(): Promise<any> {
    try {
      return await this.rpcClient.call('getmempoolinfo');
    } catch (error) {
      this.logger.error('Failed to get mempool info:', error);
      throw new RunesError('Failed to get mempool info', 'MEMPOOL_INFO_ERROR');
    }
  }

  async getRawTransaction(txid: string): Promise<any> {
    try {
      return await this.rpcClient.call('getrawtransaction', [txid, true]);
    } catch (error) {
      this.logger.error('Failed to get raw transaction:', error);
      throw new RunesError('Failed to get raw transaction', 'RAW_TX_ERROR');
    }
  }

  async decodeRawTransaction(hexstring: string): Promise<any> {
    try {
      return await this.rpcClient.call('decoderawtransaction', [hexstring]);
    } catch (error) {
      this.logger.error('Failed to decode raw transaction:', error);
      throw new RunesError('Failed to decode transaction', 'DECODE_TX_ERROR');
    }
  }

  async sendRawTransaction(hexstring: string): Promise<string> {
    try {
      return await this.rpcClient.call('sendrawtransaction', [hexstring]);
    } catch (error) {
      this.logger.error('Failed to send raw transaction:', error);
      throw new RunesError('Failed to send transaction', 'SEND_TX_ERROR');
    }
  }

  async listUnspent(minconf = 1, maxconf = 9999999): Promise<any[]> {
    try {
      return await this.rpcClient.call('listunspent', [minconf, maxconf]);
    } catch (error) {
      this.logger.error('Failed to list unspent outputs:', error);
      throw new RunesError('Failed to list unspent outputs', 'LIST_UNSPENT_ERROR');
    }
  }

  async validateAddress(address: string): Promise<any> {
    try {
      return await this.rpcClient.call('validateaddress', [address]);
    } catch (error) {
      this.logger.error('Failed to validate address:', error);
      throw new RunesError('Failed to validate address', 'VALIDATE_ADDRESS_ERROR');
    }
  }
}
