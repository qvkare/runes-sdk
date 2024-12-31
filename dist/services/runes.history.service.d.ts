import { Logger } from '../utils/logger';
import { RPCClient } from '../utils/rpc.client';
import { RuneTransaction } from '../types/rune.types';
export declare class RunesHistoryService {
    private readonly rpcClient;
    private readonly logger;
    constructor(rpcClient: RPCClient, logger: Logger);
    getTransactionHistory(address: string, limit?: number, offset?: number): Promise<RuneTransaction[]>;
    getTransaction(txid: string): Promise<RuneTransaction>;
}
