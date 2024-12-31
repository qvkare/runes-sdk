import { Logger } from './utils/logger';
import { RPCClient } from './utils/rpc.client';
import { RunesValidator } from './utils/runes.validator';
import { RunesBatchService } from './services/runes.batch.service';
import { RunesHistoryService } from './services/runes.history.service';
import { RuneInfo, RuneTransaction, RuneTransfer, BatchTransfer, BatchProcessResult } from './types/rune.types';

export {
  Logger,
  RPCClient,
  RunesValidator,
  RunesBatchService,
  RunesHistoryService,
  RuneInfo,
  RuneTransaction,
  RuneTransfer,
  BatchTransfer,
  BatchProcessResult
};

export class RunesSDK {
  private readonly rpcClient: RPCClient;
  private readonly logger: Logger;
  private readonly validator: RunesValidator;
  private readonly batchService: RunesBatchService;
  private readonly historyService: RunesHistoryService;

  constructor(
    host: string,
    username: string,
    password: string,
    logger: Logger
  ) {
    if (!host || !username || !password) {
      throw new Error('Invalid configuration: host, username, and password are required');
    }

    this.logger = logger;
    this.rpcClient = new RPCClient(host, username, password, logger);
    this.validator = new RunesValidator(this.rpcClient, logger);
    this.batchService = new RunesBatchService(this.rpcClient, this.logger, this.validator);
    this.historyService = new RunesHistoryService(this.rpcClient, logger);
  }

  async getTransactionHistory(address: string, limit?: number, offset?: number): Promise<RuneTransaction[]> {
    return this.historyService.getTransactionHistory(address, limit, offset);
  }

  async getTransaction(txid: string): Promise<RuneTransaction> {
    return this.historyService.getTransaction(txid);
  }

  async processBatch(transfers: BatchTransfer[]): Promise<BatchProcessResult> {
    return this.batchService.processBatch(transfers);
  }
} 