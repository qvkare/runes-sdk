import { RPCClient } from '../utils/rpc.client';
import { Logger } from '../utils/logger';
import { TransactionHistory } from '../types';
export declare class RunesHistoryService {
    private readonly rpcClient;
    private readonly logger;
    constructor(rpcClient: RPCClient, logger: Logger);
    getTransactionHistory(runeId: string): Promise<TransactionHistory[]>;
}
