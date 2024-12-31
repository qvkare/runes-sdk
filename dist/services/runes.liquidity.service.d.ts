import { Logger } from '../utils/logger';
import { RPCClient } from '../utils/rpc.client';
interface Pool {
    poolId: string;
    runeId: string;
    liquidity: number;
    price: number;
    volume24h: number;
    timestamp: number;
}
interface PoolCreationParams {
    runeId: string;
    initialLiquidity: number;
    initialPrice: number;
}
export declare class RunesLiquidityService {
    private readonly rpcClient;
    private readonly logger;
    constructor(rpcClient: RPCClient, logger: Logger);
    createPool(params: PoolCreationParams): Promise<Pool>;
    addLiquidity(params: {
        poolId: string;
        amount: number;
    }): Promise<Pool>;
    getPool(poolId: string): Promise<Pool>;
}
export {};
