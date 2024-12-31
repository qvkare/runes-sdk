import { RPCClient } from '../utils/rpc.client';
import { Logger } from '../utils/logger';
import { LiquidityPool } from '../types';
export declare class RunesLiquidityService {
    private readonly rpcClient;
    private readonly logger;
    constructor(rpcClient: RPCClient, logger: Logger);
    getPoolInfo(runeId: string): Promise<LiquidityPool>;
    addLiquidity(runeId: string, amount: string): Promise<{
        txId: string;
    }>;
}
