import { RPCClient } from '../utils/rpc.client';
import { Logger } from '../utils/logger';
import { RunePerformanceStats } from '../types';
interface PerformanceMetrics {
    price: string;
    volume24h: string;
    marketCap: string;
    priceChange24h: string;
}
export declare class RunesPerformanceService {
    private readonly rpcClient;
    private readonly logger;
    constructor(rpcClient: RPCClient, logger: Logger);
    getPerformanceMetrics(runeId: string): Promise<PerformanceMetrics>;
    getStats(runeId: string): Promise<RunePerformanceStats>;
}
export {};
