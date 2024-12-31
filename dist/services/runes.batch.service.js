"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunesBatchService = void 0;
class RunesBatchService {
    constructor(rpcClient, logger, validator) {
        this.rpcClient = rpcClient;
        this.logger = logger;
        this.validator = validator;
    }
    async submitBatch(transfers) {
        this.logger.info('Validating batch transfers:', transfers);
        for (const transfer of transfers) {
            const validationResult = await this.validator.validateTransfer(transfer);
            if (!validationResult.isValid) {
                this.logger.warn('Transfer validation failed:', validationResult.errors);
                throw new Error(validationResult.errors[0]);
            }
        }
        try {
            this.logger.info('Submitting batch:', transfers);
            const response = await this.rpcClient.call('submitbatch', [transfers]);
            if (!response.result) {
                this.logger.error('Invalid response from RPC');
                throw new Error('Invalid response from RPC');
            }
            return response.result;
        }
        catch (error) {
            this.logger.error('Failed to submit batch:', error);
            if (error instanceof Error && error.message === 'Invalid response from RPC') {
                throw error;
            }
            throw new Error('Failed to submit batch');
        }
    }
    async getBatchStatus(batchId) {
        try {
            this.logger.info('Getting batch status:', batchId);
            const response = await this.rpcClient.call('getbatchstatus', [batchId]);
            if (!response.result) {
                this.logger.error('Invalid response from RPC');
                throw new Error('Invalid response from RPC');
            }
            return response.result;
        }
        catch (error) {
            this.logger.error('Failed to get batch status:', error);
            if (error instanceof Error && error.message === 'Invalid response from RPC') {
                throw error;
            }
            throw new Error('Failed to get batch status');
        }
    }
}
exports.RunesBatchService = RunesBatchService;
