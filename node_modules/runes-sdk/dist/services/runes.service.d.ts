import { Logger } from '../utils/logger';
import { RPCClient } from '../utils/rpc.client';
import { RunePerformanceStats } from '../types';
import { RunesValidator } from '../utils/runes.validator';
import { Transfer } from '../utils/runes.validator';
export declare class RunesService {
    private readonly rpcClient;
    private readonly logger;
    private readonly validator;
    constructor(rpcClient: RPCClient, logger: Logger, validator: RunesValidator);
    getRuneInfo(runeId: string): Promise<RunePerformanceStats>;
    transferRune(transfer: Transfer): Promise<{
        txId: string;
    }>;
}
