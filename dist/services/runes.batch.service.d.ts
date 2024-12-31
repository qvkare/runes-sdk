import { RPCClient } from '../utils/rpc.client';
import { Logger } from '../utils/logger';
import { RunesValidator } from '../utils/runes.validator';
import { BatchSubmissionResult } from '../types';
interface Transfer {
    runeId: string;
    amount: string;
    fromAddress: string;
    toAddress: string;
}
export declare class RunesBatchService {
    private readonly rpcClient;
    private readonly logger;
    private readonly validator;
    constructor(rpcClient: RPCClient, logger: Logger, validator: RunesValidator);
    submitBatch(transfers: Transfer[]): Promise<BatchSubmissionResult>;
    getBatchStatus(batchId: string): Promise<BatchSubmissionResult>;
}
export {};
