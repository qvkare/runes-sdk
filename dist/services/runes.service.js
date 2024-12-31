"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunesService = void 0;
class RunesService {
    constructor(rpcClient, logger, validator) {
        this.rpcClient = rpcClient;
        this.logger = logger;
        this.validator = validator;
    }
    async transferRune(transfer) {
        try {
            const validationResult = this.validator.validateTransfer(transfer);
            if (!validationResult.isValid) {
                throw new Error(validationResult.errors[0] || 'Invalid transfer');
            }
            const response = await this.rpcClient.call('transfer', [transfer]);
            return response;
        }
        catch (error) {
            const errorMessage = `Failed to transfer rune: ${error instanceof Error ? error.message : 'Unknown error'}`;
            this.logger.error(errorMessage);
            throw new Error(errorMessage);
        }
    }
}
exports.RunesService = RunesService;
