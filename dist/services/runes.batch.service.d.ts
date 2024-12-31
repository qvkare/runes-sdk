import { Logger } from '../utils/logger';
import { RPCClient } from '../utils/rpc.client';
import { RunesValidator } from '../utils/runes.validator';
import { BatchProcessResult, BatchTransfer } from '../types/rune.types';
export declare class RunesBatchService {
    private readonly rpcClient;
    private readonly logger;
    private readonly validator;
    constructor(rpcClient: RPCClient, logger: Logger, validator: RunesValidator);
    processBatch(transfers: BatchTransfer[]): Promise<BatchProcessResult>;
}
