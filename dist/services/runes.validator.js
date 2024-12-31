"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunesValidator = void 0;
const logger_1 = require("../utils/logger");
class RunesValidator extends logger_1.Logger {
    constructor() {
        super('RunesValidator');
    }
    async validateTransfer(from, to, amount) {
        try {
            const errors = [];
            if (!this._validateAddress(from)) {
                errors.push('Invalid sender address');
            }
            if (!this._validateAddress(to)) {
                errors.push('Invalid recipient address');
            }
            if (!amount || amount <= BigInt(0)) {
                errors.push('Invalid amount');
            }
            return {
                isValid: errors.length === 0,
                errors
            };
        }
        catch (error) {
            this.error('Failed to validate transfer:', error);
            throw error;
        }
    }
    _validateAddress(address) {
        return Boolean(address && typeof address === 'string' && address.length >= 26 && address.length <= 35);
    }
}
exports.RunesValidator = RunesValidator;
