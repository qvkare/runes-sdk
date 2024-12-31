"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunesLiquidityService = void 0;
class RunesLiquidityService {
    constructor(rpcClient, logger) {
        this.rpcClient = rpcClient;
        this.logger = logger;
    }
    async getPoolInfo(runeId) {
        try {
            this.logger.info('Getting liquidity pool info for rune:', runeId);
            const response = await this.rpcClient.call('getpoolinfo', [runeId]);
            if (!response.result) {
                this.logger.error('Invalid response from RPC');
                throw new Error('Invalid response from RPC');
            }
            return response.result;
        }
        catch (error) {
            this.logger.error('Failed to get pool info:', error);
            if (error instanceof Error && error.message === 'Invalid response from RPC') {
                throw error;
            }
            throw new Error('Failed to get pool info');
        }
    }
    async addLiquidity(runeId, amount) {
        try {
            this.logger.info('Adding liquidity to pool:', { runeId, amount });
            const response = await this.rpcClient.call('addliquidity', [runeId, amount]);
            if (!response.result) {
                this.logger.error('Invalid response from RPC');
                throw new Error('Invalid response from RPC');
            }
            return response.result;
        }
        catch (error) {
            this.logger.error('Failed to add liquidity:', error);
            if (error instanceof Error && error.message === 'Invalid response from RPC') {
                throw error;
            }
            throw new Error('Failed to add liquidity');
        }
    }
}
exports.RunesLiquidityService = RunesLiquidityService;
