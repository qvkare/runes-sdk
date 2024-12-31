import { RPCClient } from '../../utils/rpc.client';
import { Logger } from '../../utils/logger';

interface MempoolTransaction {
  txid: string;
  size: number;
  fee: number;
  time: number;
  height?: number;
  descendantcount?: number;
  descendantsize?: number;
  descendantfees?: number;
  ancestorcount?: number;
  ancestorsize?: number;
  ancestorfees?: number;
}

interface TransactionStatus {
  confirmed: boolean;
  blockHeight?: number;
  confirmations: number;
  timestamp: number;
}

export class MempoolService {
  private watchInterval: NodeJS.Timeout | null = null;
  private readonly DEFAULT_WATCH_INTERVAL = 10000; // 10 seconds

  constructor(
    private readonly rpcClient: RPCClient,
    private readonly logger: Logger
  ) {}

  async watchMempool(callback: (transactions: MempoolTransaction[]) => void, interval = this.DEFAULT_WATCH_INTERVAL): Promise<void> {
    try {
      const transactions = await this.scanMempool();
      callback(transactions);

      this.watchInterval = setInterval(async () => {
        try {
          const transactions = await this.scanMempool();
          callback(transactions);
        } catch (_error) {
          this.logger.error('Failed to scan mempool: Invalid transaction data in response');
        }
      }, interval);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Network error')) {
        this.logger.error('Failed to start watching mempool: Network error');
      } else {
        this.logger.error('Failed to start watching mempool: Invalid transaction data in response');
      }
    }
  }

  stopWatching(): void {
    if (this.watchInterval) {
      clearInterval(this.watchInterval);
      this.watchInterval = null;
    }
    this.logger.info('Stopped watching mempool');
  }

  async getTransactionStatus(txid: string): Promise<TransactionStatus> {
    try {
      if (!txid) {
        throw new Error('Transaction ID is required');
      }

      const response = await this.rpcClient.call('gettxstatus', [txid]);
      if (!response || typeof response.confirmed !== 'boolean') {
        throw new Error('Invalid response from RPC');
      }

      return {
        confirmed: response.confirmed,
        blockHeight: response.blockHeight,
        confirmations: response.confirmations,
        timestamp: response.timestamp
      };
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Failed to get transaction status: ${error.message}`);
        throw new Error(`Failed to get transaction status: ${error.message}`);
      } else {
        this.logger.error('Failed to get transaction status: Unknown error');
        throw new Error('Failed to get transaction status: Unknown error');
      }
    }
  }

  async scanMempool(): Promise<MempoolTransaction[]> {
    try {
      const response = await this.rpcClient.call('getrawmempool', [true]);
      if (!response || !Array.isArray(response)) {
        throw new Error('Invalid response from RPC');
      }

      return response.map((tx: any): MempoolTransaction => {
        if (!tx.txid || typeof tx.size !== 'number' || typeof tx.fee !== 'number' || typeof tx.time !== 'number') {
          throw new Error('Invalid transaction data in response');
        }

        return {
          txid: tx.txid,
          size: tx.size,
          fee: tx.fee,
          time: tx.time,
          height: tx.height,
          descendantcount: tx.descendantcount,
          descendantsize: tx.descendantsize,
          descendantfees: tx.descendantfees,
          ancestorcount: tx.ancestorcount,
          ancestorsize: tx.ancestorsize,
          ancestorfees: tx.ancestorfees
        };
      });
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Failed to scan mempool: ${error.message}`);
        throw new Error(`Failed to scan mempool: ${error.message}`);
      } else {
        this.logger.error('Failed to scan mempool: Unknown error');
        throw new Error('Failed to scan mempool: Unknown error');
      }
    }
  }
} 