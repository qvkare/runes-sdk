import { Logger } from './utils/logger';
import { RPCClient } from './utils/rpc.client';
import { RunesValidator } from './utils/runes.validator';
import { RunesBatchService } from './services/runes.batch.service';
import { RunesHistoryService } from './services/runes.history.service';
import { RuneInfo, RuneTransaction, RuneTransfer, BatchTransfer, BatchProcessResult } from './types/rune.types';
export { Logger, RPCClient, RunesValidator, RunesBatchService, RunesHistoryService, RuneInfo, RuneTransaction, RuneTransfer, BatchTransfer, BatchProcessResult };
export declare class RunesSDK {
    private readonly rpcClient;
    private readonly logger;
    private readonly validator;
    private readonly batchService;
    private readonly historyService;
    constructor(host: string, username: string, password: string, logger: Logger);
    getTransactionHistory(address: string, limit?: number, offset?: number): Promise<RuneTransaction[]>;
    getTransaction(txid: string): Promise<RuneTransaction>;
    processBatch(transfers: BatchTransfer[]): Promise<BatchProcessResult>;
}
