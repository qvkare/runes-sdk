import { Logger } from '../utils/logger';
import { RPCClient } from '../utils/rpc.client';
interface Metrics {
    avgBlockTime: number;
    transactions: number;
    volume: string;
    timestamp: number;
    tps: number;
    blockHeight: number;
    memoryUsage: number;
    cpuUsage: number;
}
interface RunePerformance {
    runeId: string;
    throughput: number;
    latency: number;
    errorRate: number;
    lastUpdated: number;
    successRate: number;
    avgResponseTime: number;
    peakThroughput: number;
}
export declare class RunesPerformanceService {
    private readonly rpcClient;
    private readonly logger;
    constructor(rpcClient: RPCClient, logger: Logger);
    getMetrics(): Promise<Metrics>;
    getRunePerformance(runeId: string): Promise<RunePerformance>;
}
export {};
