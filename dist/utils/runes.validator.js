"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunesValidator = void 0;
class RunesValidator {
    constructor(rpcClient, logger) {
        this.rpcClient = rpcClient;
        this.logger = logger;
    }
    async validateTransfer(transfer) {
        try {
            this.logger.info('Validating transfer:', transfer);
            const response = await this.rpcClient.call('validatetransfer', [transfer]);
            if (!response.result) {
                this.logger.error('Invalid response from RPC');
                throw new Error('Invalid response from RPC');
            }
            return {
                isValid: response.result.valid,
                errors: response.result.errors || [],
                warnings: response.result.warnings || []
            };
        }
        catch (error) {
            this.logger.error('Failed to validate transfer:', error);
            if (error instanceof Error && error.message === 'Invalid response from RPC') {
                throw error;
            }
            throw new Error('Failed to validate transfer');
        }
    }
    async validateAddress(address) {
        try {
            this.logger.info('Validating address:', address);
            const response = await this.rpcClient.call('validateaddress', [address]);
            if (!response.result) {
                this.logger.error('Invalid response from RPC');
                throw new Error('Invalid response from RPC');
            }
            const isValid = response.result.isvalid ?? false;
            return {
                isValid,
                errors: isValid ? [] : ['Invalid address'],
                warnings: []
            };
        }
        catch (error) {
            this.logger.error('Failed to validate address:', error);
            if (error instanceof Error && error.message === 'Invalid response from RPC') {
                throw error;
            }
            throw new Error('Failed to validate address');
        }
    }
    async validateRuneId(runeId) {
        try {
            this.logger.info('Validating rune ID:', runeId);
            const response = await this.rpcClient.call('validateruneid', [runeId]);
            if (!response.result) {
                this.logger.error('Invalid response from RPC');
                throw new Error('Invalid response from RPC');
            }
            const exists = response.result.exists ?? false;
            return {
                isValid: exists,
                errors: exists ? [] : ['Invalid rune ID'],
                warnings: []
            };
        }
        catch (error) {
            this.logger.error('Failed to validate rune ID:', error);
            if (error instanceof Error && error.message === 'Invalid response from RPC') {
                throw error;
            }
            throw new Error('Failed to validate rune ID');
        }
    }
    isValidAmount(amount) {
        const numAmount = parseFloat(amount);
        return !isNaN(numAmount) && numAmount > 0;
    }
}
exports.RunesValidator = RunesValidator;
