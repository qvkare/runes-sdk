"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunesValidator = void 0;
class RunesValidator {
    constructor(rpcClient, logger) {
        this.rpcClient = rpcClient;
        this.logger = logger;
    }
    validateTransfer(params) {
        const errors = [];
        if (!params.from) {
            errors.push('From address is required');
        }
        if (!params.to) {
            errors.push('To address is required');
        }
        if (!params.amount) {
            errors.push('Amount is required');
        }
        else {
            const amount = Number(params.amount);
            if (isNaN(amount)) {
                errors.push('Amount must be a valid number');
            }
            else if (amount < 0) {
                errors.push('Amount must be a positive number');
            }
            else if (amount === 0) {
                errors.push('Amount must be greater than zero');
            }
        }
        return {
            isValid: errors.length === 0,
            errors,
            operations: errors.length === 0 ? [{ type: 'transfer', ...params }] : []
        };
    }
}
exports.RunesValidator = RunesValidator;
