import { Logger } from '../utils/logger';
import { RuneTransfer } from '../types';
import { RPCClient } from '../utils/rpc.client';

interface RuneHistory {
  transfers: RuneTransfer[];
  totalCount: number;
  startBlock: number;
  endBlock: number;
}

interface AddressHistory {
  sent: Array<{
    txid: string;
    amount: string;
    timestamp: number;
  }>;
  received: Array<{
    txid: string;
    amount: string;
    timestamp: number;
  }>;
  totalSent: string;
  totalReceived: string;
  balance: string;
  lastActivity: number;
  transferCount: number;
}

interface TransferStats {
  totalTransfers: number;
  totalVolume: string;
  averageAmount: string;
  largestAmount: string;
  smallestAmount: string;
  timeRange: {
    start: number;
    end: number;
  };
}

interface RPCTransfer {
  txid: string;
  amount: string;
  timestamp: number;
}

interface RPCRuneTransfer extends RPCTransfer {
  rune: string;
  from: string;
  to: string;
  blockHeight: number;
  status: string;
}

interface RPCAddressHistory {
  sent: RPCTransfer[];
  received: RPCTransfer[];
}

/**
 * Service for managing Rune transfer history and analytics
 */
export class RuneHistoryService {
  private logger: Logger;
  private rpcClient: RPCClient;

  constructor() {
    this.logger = new Logger('RuneHistoryService');
    this.rpcClient = new RPCClient({
      rpcUrl: 'http://localhost:8332',
      username: 'test',
      password: 'test',
      network: 'regtest'
    });
  }

  /**
   * Gets transfer history for a specific address
   * @param address The address to get history for
   * @returns Address history including sent/received amounts and balances
   */
  async getAddressHistory(address: string, startBlock: number, endBlock: number): Promise<AddressHistory> {
    try {
      const response = await this.rpcClient.call<RPCAddressHistory>('getaddresshistory', [address, startBlock, endBlock]);
      
      const sent = response.sent.map((tx: RPCTransfer) => ({
        txid: tx.txid,
        amount: tx.amount,
        timestamp: tx.timestamp
      }));

      const received = response.received.map((tx: RPCTransfer) => ({
        txid: tx.txid,
        amount: tx.amount,
        timestamp: tx.timestamp
      }));

      const totalSent = sent.reduce((sum: bigint, tx: RPCTransfer) => sum + BigInt(tx.amount), BigInt(0)).toString();
      const totalReceived = received.reduce((sum: bigint, tx: RPCTransfer) => sum + BigInt(tx.amount), BigInt(0)).toString();

      return {
        sent,
        received,
        totalSent,
        totalReceived,
        balance: (BigInt(totalReceived) - BigInt(totalSent)).toString(),
        lastActivity: Math.max(...[...sent, ...received].map(tx => tx.timestamp)),
        transferCount: sent.length + received.length
      };
    } catch (error) {
      throw new Error(`Failed to get address history: ${error}`);
    }
  }

  /**
   * Gets transfer statistics for a time period
   * @param startTime Start timestamp
   * @param endTime End timestamp
   * @returns Transfer statistics including volumes and averages
   */
  async getTransferStats(rune: string): Promise<TransferStats> {
    try {
      const transfers = await this._getTransfersByTimeRange(0, Date.now());
      const runeTransfers = transfers.filter(t => t.rune === rune);

      if (runeTransfers.length === 0) {
        return {
          totalTransfers: 0,
          totalVolume: '0',
          averageAmount: '0',
          largestAmount: '0',
          smallestAmount: '0',
          timeRange: {
            start: 0,
            end: Date.now()
          }
        };
      }

      const amounts = runeTransfers.map(t => BigInt(t.amount));
      const totalVolume = amounts.reduce((a, b) => a + b, BigInt(0));
      const averageAmount = totalVolume / BigInt(runeTransfers.length);
      const largestAmount = amounts.reduce((a, b) => a > b ? a : b);
      const smallestAmount = amounts.reduce((a, b) => a < b ? a : b);

      return {
        totalTransfers: runeTransfers.length,
        totalVolume: totalVolume.toString(),
        averageAmount: averageAmount.toString(),
        largestAmount: largestAmount.toString(),
        smallestAmount: smallestAmount.toString(),
        timeRange: {
          start: 0,
          end: Date.now()
        }
      };
    } catch (error) {
      throw new Error(`Failed to get transfer stats: ${error}`);
    }
  }

  /**
   * Gets transfers within a time range
   * @param startTime Start timestamp
   * @param endTime End timestamp
   * @returns Array of transfers
   */
  private async _getTransfersByTimeRange(startTime: number, endTime: number): Promise<RuneTransfer[]> {
    try {
      const response = await this.rpcClient.call<RPCRuneTransfer[]>('gettransfers', [startTime, endTime]);

      return response.map((item: RPCRuneTransfer) => ({
        txid: item.txid,
        rune: item.rune,
        amount: item.amount,
        from: item.from,
        to: item.to,
        timestamp: item.timestamp,
        blockHeight: item.blockHeight,
        status: item.status as 'pending' | 'confirmed' | 'failed'
      }));
    } catch (error) {
      this.logger.error('Failed to get transfers by time range:', error);
      throw error;
    }
  }

  async getRuneHistory(rune: string, startBlock: number, endBlock: number): Promise<RuneHistory> {
    try {
      const response = await this.rpcClient.call<RPCRuneTransfer[]>('getrune', [rune, startBlock, endBlock]);
      const transfers = response.map((tx: RPCRuneTransfer) => ({
        txid: tx.txid,
        rune: tx.rune,
        amount: tx.amount,
        from: tx.from,
        to: tx.to,
        timestamp: tx.timestamp,
        blockHeight: tx.blockHeight,
        status: tx.status as 'pending' | 'confirmed' | 'failed'
      }));

      return {
        transfers,
        totalCount: transfers.length,
        startBlock,
        endBlock
      };
    } catch (error) {
      throw new Error(`Failed to get rune history: ${error}`);
    }
  }
} 