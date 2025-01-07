import { RpcClient as IRpcClient } from '../../types/rpc.types';
import { Logger } from '../../types/logger.types';

export class MempoolMonitorService {
  constructor(
    private readonly rpcClient: IRpcClient,
    private readonly logger: Logger
  ) {}

  async watchTransaction(txid: string): Promise<void> {
    try {
      await this.rpcClient.watchTransaction(txid);
      this.logger.info('Transaction found in mempool:', txid);
    } catch (error) {
      this.logger.error('Failed to watch transaction:', txid, error);
      throw error;
    }
  }

  async stopWatchingTransaction(txid: string): Promise<void> {
    try {
      await this.rpcClient.stopWatchingTransaction(txid);
      this.logger.info('Stopped watching transaction:', txid);
    } catch (error) {
      this.logger.error('Failed to stop watching transaction:', txid, error);
      throw error;
    }
  }
}
