import { BitcoinCoreService } from './bitcoin-core';
import { Logger } from '../utils/logger';

export class MonitoringService {
  private monitoring: boolean = false;
  private interval: NodeJS.Timeout | null = null;

  constructor(
    private readonly bitcoinCore: BitcoinCoreService,
    private readonly logger: Logger
  ) {}

  public async startMonitoring(callback: (blockHeight: number) => void): Promise<void> {
    if (this.monitoring) {
      throw new Error('Already monitoring');
    }

    try {
      this.monitoring = true;
      this.interval = setInterval(async () => {
        try {
          const blockHeight = await this.bitcoinCore.getBlockCount();
          callback(blockHeight);
        } catch (error) {
          this.logger.error('Error while monitoring block height:', error);
        }
      }, 10000); // Check every 10 seconds
    } catch (error) {
      this.monitoring = false;
      throw new Error('Failed to start monitoring');
    }
  }

  public stopMonitoring(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.monitoring = false;
  }

  public isMonitoring(): boolean {
    return this.monitoring;
  }

  public async getNetworkStatus(): Promise<{ blockHeight: number; memPoolInfo: any }> {
    try {
      const [blockHeight, memPoolInfo] = await Promise.all([
        this.bitcoinCore.getBlockCount(),
        this.bitcoinCore.getMemPoolInfo(),
      ]);

      return { blockHeight, memPoolInfo };
    } catch (error) {
      throw new Error('Failed to get network status');
    }
  }

  public updateUtxoCount(symbol: string, count: number): void {
    this.logger.info(`UTXO count for ${symbol}: ${count}`);
  }

  public logError(message: string, error: any): void {
    this.logger.error(message, error);
  }

  public logInfo(message: string, data?: any): void {
    this.logger.info(message, data);
  }
}
