"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunesValidator = void 0;
class RunesValidator {
    constructor(rpcClient, logger) {
        this.rpcClient = rpcClient;
        this.logger = logger;
    }
    // Logger interface implementation
    get level() { return this.logger.level; }
    get context() { return this.logger.context; }
    info(message) { this.logger.info(message); }
    warn(message) { this.logger.warn(message); }
    error(message) { this.logger.error(message); }
    debug(message) { this.logger.debug(message); }
    shouldLog(level) { return this.logger.shouldLog(level); }
    // Validation methods
    async validateAddress(address) {
        try {
            const response = await this.rpcClient.call('validateaddress', [address]);
            return { isValid: response.isvalid };
        }
        catch (error) {
            const errorMessage = `Failed to validate address: ${error instanceof Error ? error.message : 'Unknown error'}`;
            this.logger.error(errorMessage);
            return { isValid: false, error: errorMessage };
        }
    }
    async validateTransfer(params) {
        try {
            const [fromValid, toValid, runeValid] = await Promise.all([
                this.validateAddress(params.from),
                this.validateAddress(params.to),
                this.validateRuneExists(params.runeId)
            ]);
            if (!fromValid.isValid) {
                return { isValid: false, error: 'Invalid sender address' };
            }
            if (!toValid.isValid) {
                return { isValid: false, error: 'Invalid recipient address' };
            }
            if (!runeValid.isValid) {
                return { isValid: false, error: 'Invalid rune ID' };
            }
            if (params.amount <= 0) {
                return { isValid: false, error: 'Invalid amount' };
            }
            return { isValid: true };
        }
        catch (error) {
            const errorMessage = `Failed to validate transfer: ${error instanceof Error ? error.message : 'Unknown error'}`;
            this.logger.error(errorMessage);
            return { isValid: false, error: errorMessage };
        }
    }
    async validateAmount(amount) {
        if (typeof amount !== 'number' || amount <= 0) {
            return { isValid: false, error: 'Invalid amount' };
        }
        return { isValid: true };
    }
    validateRuneId(runeId) {
        if (!runeId || typeof runeId !== 'string' || runeId.length !== 64) {
            return { isValid: false, error: 'Invalid rune ID format' };
        }
        return { isValid: true };
    }
    async validateRuneExists(runeId) {
        try {
            const exists = await this.rpcClient.call('runeexists', [runeId]);
            return { isValid: exists };
        }
        catch (error) {
            const errorMessage = `Failed to validate rune existence: ${error instanceof Error ? error.message : 'Unknown error'}`;
            this.logger.error(errorMessage);
            return { isValid: false, error: errorMessage };
        }
    }
}
exports.RunesValidator = RunesValidator;
