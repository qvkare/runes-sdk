"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunesLiquidityService = void 0;
class RunesLiquidityService {
    constructor(rpcClient, logger) {
        this.rpcClient = rpcClient;
        this.logger = logger;
    }
    async createPool(params) {
        try {
            const response = await this.rpcClient.call('createpool', [params]);
            if (!response || !response.poolId) {
                throw new Error('Invalid response from RPC');
            }
            return {
                poolId: response.poolId,
                runeId: response.runeId,
                liquidity: response.liquidity,
                price: response.price,
                volume24h: response.volume24h,
                timestamp: response.timestamp
            };
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Failed to create pool: ${error.message}`);
                throw new Error(`Failed to create pool: ${error.message}`);
            }
            else {
                this.logger.error('Failed to create pool: Unknown error');
                throw new Error('Failed to create pool: Unknown error');
            }
        }
    }
    async addLiquidity(params) {
        try {
            const response = await this.rpcClient.call('addliquidity', [params]);
            if (!response || !response.poolId) {
                throw new Error('Invalid response from RPC');
            }
            return {
                poolId: response.poolId,
                runeId: response.runeId,
                liquidity: response.liquidity,
                price: response.price,
                volume24h: response.volume24h,
                timestamp: response.timestamp
            };
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Failed to add liquidity: ${error.message}`);
                throw new Error(`Failed to add liquidity: ${error.message}`);
            }
            else {
                this.logger.error('Failed to add liquidity: Unknown error');
                throw new Error('Failed to add liquidity: Unknown error');
            }
        }
    }
    async getPool(poolId) {
        try {
            const response = await this.rpcClient.call('getpool', [poolId]);
            if (!response || !response.poolId) {
                throw new Error('Invalid response from RPC');
            }
            return {
                poolId: response.poolId,
                runeId: response.runeId,
                liquidity: response.liquidity,
                price: response.price,
                volume24h: response.volume24h,
                timestamp: response.timestamp
            };
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Failed to get pool: ${error.message}`);
                throw new Error(`Failed to get pool: ${error.message}`);
            }
            else {
                this.logger.error('Failed to get pool: Unknown error');
                throw new Error('Failed to get pool: Unknown error');
            }
        }
    }
}
exports.RunesLiquidityService = RunesLiquidityService;
