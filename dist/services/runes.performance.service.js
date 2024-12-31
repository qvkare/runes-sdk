"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunesPerformanceService = void 0;
class RunesPerformanceService {
    constructor(rpcClient, logger) {
        this.rpcClient = rpcClient;
        this.logger = logger;
    }
    async getMetrics() {
        try {
            const response = await this.rpcClient.call('getmetrics', []);
            if (!response || typeof response.avgBlockTime !== 'number') {
                throw new Error('Invalid response from RPC');
            }
            return {
                avgBlockTime: response.avgBlockTime,
                transactions: response.transactions,
                volume: response.volume,
                timestamp: response.timestamp,
                tps: response.tps,
                blockHeight: response.blockHeight,
                memoryUsage: response.memoryUsage,
                cpuUsage: response.cpuUsage
            };
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Failed to get metrics: ${error.message}`);
                throw new Error(`Failed to get metrics: ${error.message}`);
            }
            else {
                this.logger.error('Failed to get metrics: Unknown error');
                throw new Error('Failed to get metrics: Unknown error');
            }
        }
    }
    async getRunePerformance(runeId) {
        try {
            if (!runeId) {
                throw new Error('Rune ID is required');
            }
            const response = await this.rpcClient.call('getruneperformance', [runeId]);
            if (!response || typeof response.throughput !== 'number') {
                throw new Error('Invalid response from RPC');
            }
            return {
                runeId,
                throughput: response.throughput,
                latency: response.latency,
                errorRate: response.errorRate,
                lastUpdated: response.lastUpdated,
                successRate: response.successRate || 100 - response.errorRate,
                avgResponseTime: response.avgResponseTime || response.latency,
                peakThroughput: response.peakThroughput || response.throughput
            };
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Failed to get rune performance: ${error.message}`);
                throw new Error(`Failed to get rune performance: ${error.message}`);
            }
            else {
                this.logger.error('Failed to get rune performance: Unknown error');
                throw new Error('Failed to get rune performance: Unknown error');
            }
        }
    }
}
exports.RunesPerformanceService = RunesPerformanceService;
