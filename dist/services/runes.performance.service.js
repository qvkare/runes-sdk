"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunesPerformanceService = void 0;
class RunesPerformanceService {
    constructor(rpcClient, logger) {
        this.rpcClient = rpcClient;
        this.logger = logger;
    }
    async getPerformanceMetrics(runeId) {
        try {
            const response = await this.rpcClient.call('getperformancemetrics', [runeId]);
            if (!response.result) {
                throw new Error('Empty response received');
            }
            return response.result;
        }
        catch (error) {
            this.logger.error('Failed to get performance metrics:', error);
            throw new Error('Failed to get performance metrics');
        }
    }
    async getStats(runeId) {
        this.logger.info(`Fetching performance stats for rune: ${runeId}`);
        try {
            const response = await this.rpcClient.call('getrunestats', [runeId]);
            if (!response.result) {
                throw new Error('Empty response received');
            }
            return response.result;
        }
        catch (error) {
            this.logger.error('Failed to get rune stats:', error);
            throw new Error('Failed to get rune stats');
        }
    }
}
exports.RunesPerformanceService = RunesPerformanceService;
