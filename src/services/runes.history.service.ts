import { Logger } from '../utils/logger';
import { RunesTransfer } from '../types/runes.types';
import { RPCClient } from '../utils/rpc.client';

interface RunesHistory {
  transfers: RunesTransfer[];
  totalCount: number;
  startBlock: number;
  endBlock: number;
  lastUpdated: number;
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

interface RPCRunesTransfer extends RPCTransfer {
  runes: string;
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
export class RunesHistoryService extends Logger {
  constructor(private readonly rpcClient: RPCClient) {
    super('RunesHistoryService');
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

      const totalSent = sent.reduce((sum: bigint, tx) => sum + BigInt(tx.amount), BigInt(0)).toString();
      const totalReceived = received.reduce((sum: bigint, tx) => sum + BigInt(tx.amount), BigInt(0)).toString();

      return {
        sent,
        received,
        totalSent,
        totalReceived,
        balance: (BigInt(totalReceived) - BigInt(totalSent)).toString(),
        lastActivity: Math.max(...[...sent, ...received].map(tx => tx.timestamp), 0),
        transferCount: sent.length + received.length
      };
    } catch (error) {
      this.error('Failed to get address history:', error);
      throw new Error(`Failed to get address history: ${error}`);
    }
  }

  /**
   * Gets transfer statistics for a time period
   * @param startTime Start timestamp
   * @param endTime End timestamp
   * @returns Transfer statistics including volumes and averages
   */
  async getTransferStats(runes: string): Promise<TransferStats> {
    try {
      const startTime = 0;
      const endTime = Date.now();
      const transfers = await this._getTransfersByTimeRange(runes, startTime, endTime);
      
      if (transfers.length === 0) {
        return {
          totalTransfers: 0,
          totalVolume: '0',
          averageAmount: '0',
          largestAmount: '0',
          smallestAmount: '0',
          timeRange: {
            start: startTime,
            end: endTime
          }
        };
      }

      const amounts = transfers.map(t => BigInt(t.amount));
      const totalVolume = amounts.reduce((a, b) => a + b, BigInt(0));
      const averageAmount = totalVolume / BigInt(transfers.length);
      const largestAmount = amounts.reduce((a, b) => a > b ? a : b);
      const smallestAmount = amounts.reduce((a, b) => a < b ? a : b);

      return {
        totalTransfers: transfers.length,
        totalVolume: totalVolume.toString(),
        averageAmount: averageAmount.toString(),
        largestAmount: largestAmount.toString(),
        smallestAmount: smallestAmount.toString(),
        timeRange: {
          start: startTime,
          end: endTime
        }
      };
    } catch (error) {
      this.error('Failed to get transfer stats:', error);
      throw new Error('Failed to get transfer stats');
    }
  }

  /**
   * Gets transfers within a time range
   * @param startTime Start timestamp
   * @param endTime End timestamp
   * @returns Array of transfers
   */
  private async _getTransfersByTimeRange(runes: string, startTime: number, endTime: number): Promise<RunesTransfer[]> {
    try {
      const response = await this.rpcClient.call<RPCRunesTransfer[]>('gettransfersbyrange', [runes, startTime, endTime]);
      return response.map(transfer => ({
        txid: transfer.txid,
        runes: transfer.runes,
        from: transfer.from,
        to: transfer.to,
        amount: transfer.amount,
        timestamp: transfer.timestamp,
        blockHeight: transfer.blockHeight,
        status: transfer.status as 'confirmed' | 'pending' | 'failed'
      }));
    } catch (error) {
      this.error('Failed to get transfers by time range:', error);
      throw error;
    }
  }

  async getRunesHistory(runes: string, startBlock: number, endBlock: number): Promise<RunesHistory> {
    try {
      const transfers = await this._getTransfersByBlockRange(runes, startBlock, endBlock);
      return {
        transfers,
        totalCount: transfers.length,
        startBlock,
        endBlock,
        lastUpdated: Date.now()
      };
    } catch (error) {
      this.error('Failed to get runes history:', error);
      throw new Error('Failed to get runes history');
    }
  }

  private async _getTransfersByBlockRange(runes: string, startBlock: number, endBlock: number): Promise<RunesTransfer[]> {
    try {
      const response = await this.rpcClient.call<RPCRunesTransfer[]>('gettransfers', [runes, startBlock, endBlock]);
      return response.map(transfer => ({
        txid: transfer.txid,
        runes: transfer.runes,
        from: transfer.from,
        to: transfer.to,
        amount: transfer.amount,
        timestamp: transfer.timestamp,
        blockHeight: transfer.blockHeight,
        status: transfer.status as 'confirmed' | 'pending' | 'failed'
      }));
    } catch (error) {
      this.error('Failed to get transfers by block range:', error);
      throw error;
    }
  }
} 