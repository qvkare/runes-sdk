"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunesHistoryService = void 0;
class RunesHistoryService {
    constructor(rpcClient, logger) {
        this.rpcClient = rpcClient;
        this.logger = logger;
    }
    async getTransactionHistory(runeId) {
        try {
            this.logger.info('Getting transaction history for rune:', runeId);
            const response = await this.rpcClient.call('gettransactionhistory', [runeId]);
            if (!response.result) {
                this.logger.error('Invalid response from RPC');
                throw new Error('Invalid response from RPC');
            }
            return response.result;
        }
        catch (error) {
            this.logger.error('Failed to get transaction history:', error);
            if (error instanceof Error && error.message === 'Invalid response from RPC') {
                throw error;
            }
            throw new Error('Failed to get transaction history');
        }
    }
}
exports.RunesHistoryService = RunesHistoryService;
