"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunesAPI = void 0;
class RunesAPI {
    constructor(rpcClient, validator, logger) {
        this.rpcClient = rpcClient;
        this.validator = validator;
        this.logger = logger;
    }
    async createRune(params) {
        try {
            const response = await this.rpcClient.call('createrune', [params]);
            return response;
        }
        catch (error) {
            const errorMessage = `Failed to create rune: ${error instanceof Error ? error.message : 'Unknown error'}`;
            this.logger.error(errorMessage);
            throw new Error(errorMessage);
        }
    }
    async transferRune(params) {
        try {
            const validationResult = await this.validator.validateTransfer({
                from: params.from,
                to: params.to,
                amount: params.amount
            });
            if (!validationResult.isValid) {
                throw new Error(validationResult.errors.join(', '));
            }
            const response = await this.rpcClient.call('transferrune', [params]);
            return response;
        }
        catch (error) {
            const errorMessage = `Failed to transfer rune: ${error instanceof Error ? error.message : 'Unknown error'}`;
            this.logger.error(errorMessage);
            throw new Error(errorMessage);
        }
    }
    async getRuneInfo(runeId) {
        try {
            const response = await this.rpcClient.call('getruneinfo', [runeId]);
            return response;
        }
        catch (error) {
            const errorMessage = `Failed to get rune info: ${error instanceof Error ? error.message : 'Unknown error'}`;
            this.logger.error(errorMessage);
            throw new Error(errorMessage);
        }
    }
    async getRuneBalance(runeId, address) {
        try {
            const response = await this.rpcClient.call('getrunebalance', [runeId, address]);
            return response.balance;
        }
        catch (error) {
            const errorMessage = `Failed to get rune balance: ${error instanceof Error ? error.message : 'Unknown error'}`;
            this.logger.error(errorMessage);
            throw new Error(errorMessage);
        }
    }
}
exports.RunesAPI = RunesAPI;
