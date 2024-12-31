"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunesService = void 0;
class RunesService {
    constructor(rpcClient, logger, validator) {
        this.rpcClient = rpcClient;
        this.logger = logger;
        this.validator = validator;
    }
    async getRuneInfo(runeId) {
        try {
            this.logger.info('Getting rune info for:', runeId);
            const response = await this.rpcClient.call('getruneinfo', [runeId]);
            if (!response.result) {
                this.logger.error('Invalid response from RPC');
                throw new Error('Invalid response from RPC');
            }
            return response.result;
        }
        catch (error) {
            this.logger.error('Failed to get rune info:', error);
            if (error instanceof Error && error.message === 'Invalid response from RPC') {
                throw error;
            }
            throw new Error('Failed to get rune info');
        }
    }
    async transferRune(transfer) {
        const validationResult = await this.validator.validateTransfer(transfer);
        if (!validationResult.isValid) {
            this.logger.warn('Transfer validation failed:', validationResult.errors);
            throw new Error(validationResult.errors[0]);
        }
        try {
            this.logger.info('Transferring rune:', transfer);
            const response = await this.rpcClient.call('transferrune', [
                transfer.runeId,
                transfer.amount,
                transfer.fromAddress,
                transfer.toAddress
            ]);
            if (!response.result) {
                this.logger.error('Invalid response from RPC');
                throw new Error('Invalid response from RPC');
            }
            return response.result;
        }
        catch (error) {
            this.logger.error('Failed to transfer rune:', error);
            if (error instanceof Error && error.message === 'Invalid response from RPC') {
                throw error;
            }
            throw new Error('Failed to transfer rune');
        }
    }
}
exports.RunesService = RunesService;
