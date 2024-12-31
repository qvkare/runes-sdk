"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunesHistoryService = void 0;
class RunesHistoryService {
    constructor(rpcClient, logger) {
        this.rpcClient = rpcClient;
        this.logger = logger;
    }
    async getTransactionHistory(address, limit, offset) {
        try {
            const params = [address];
            if (limit !== undefined)
                params.push(limit.toString());
            if (offset !== undefined)
                params.push(offset.toString());
            const response = await this.rpcClient.call('gettransactionhistory', params);
            return response;
        }
        catch (error) {
            const errorMessage = `Failed to get transaction history: ${error instanceof Error ? error.message : 'Unknown error'}`;
            this.logger.error(errorMessage);
            throw new Error(errorMessage);
        }
    }
    async getTransaction(txid) {
        try {
            const response = await this.rpcClient.call('gettransaction', [txid]);
            return response;
        }
        catch (error) {
            const errorMessage = `Failed to get transaction: ${error instanceof Error ? error.message : 'Unknown error'}`;
            this.logger.error(errorMessage);
            throw new Error(errorMessage);
        }
    }
}
exports.RunesHistoryService = RunesHistoryService;
