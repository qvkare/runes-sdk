"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunesSecurityService = void 0;
class RunesSecurityService {
    constructor(rpcClient, logger) {
        this.rpcClient = rpcClient;
        this.logger = logger;
    }
    async verifyTransaction(txId) {
        try {
            if (!txId) {
                throw new Error('Transaction ID is required');
            }
            const response = await this.rpcClient.call('verifytransaction', [txId]);
            if (!response || typeof response.isValid !== 'boolean') {
                throw new Error('Invalid response from RPC');
            }
            return {
                txId,
                isValid: response.isValid,
                signatures: response.signatures || [],
                timestamp: response.timestamp,
                reason: response.reason
            };
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Failed to verify transaction: ${error.message}`);
                throw new Error(`Failed to verify transaction: ${error.message}`);
            }
            else {
                this.logger.error('Failed to verify transaction: Unknown error');
                throw new Error('Failed to verify transaction: Unknown error');
            }
        }
    }
    async checkRuneSecurity(runeId) {
        try {
            if (!runeId) {
                throw new Error('Rune ID is required');
            }
            const response = await this.rpcClient.call('checkrunesecurity', [runeId]);
            if (!response || typeof response.isSecure !== 'boolean') {
                throw new Error('Invalid response from RPC');
            }
            return {
                runeId: response.runeId,
                isSecure: response.isSecure,
                vulnerabilities: response.vulnerabilities || [],
                lastAudit: response.lastAudit
            };
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Failed to check rune security: ${error.message}`);
                throw new Error(`Failed to check rune security: ${error.message}`);
            }
            else {
                this.logger.error('Failed to check rune security: Unknown error');
                throw new Error('Failed to check rune security: Unknown error');
            }
        }
    }
}
exports.RunesSecurityService = RunesSecurityService;
