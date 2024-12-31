"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunesSecurityService = void 0;
class RunesSecurityService {
    constructor(rpcClient, logger) {
        this.rpcClient = rpcClient;
        this.logger = logger;
    }
    async verifyRune(runeId) {
        try {
            this.logger.info('Verifying rune:', runeId);
            const response = await this.rpcClient.call('verifyrune', [runeId]);
            if (!response.result) {
                this.logger.error('Invalid response from RPC');
                throw new Error('Invalid response from RPC');
            }
            if (!response.result.verified) {
                this.logger.warn('Rune verification failed:', runeId);
            }
            return response.result.verified;
        }
        catch (error) {
            this.logger.error('Failed to verify rune:', error);
            if (error instanceof Error && error.message === 'Invalid response from RPC') {
                throw error;
            }
            throw new Error('Failed to verify rune');
        }
    }
    async checkSecurity(runeId) {
        try {
            this.logger.info('Checking security for rune:', runeId);
            const response = await this.rpcClient.call('checksecurity', [runeId]);
            if (!response.result) {
                this.logger.error('Invalid response from RPC');
                throw new Error('Invalid response from RPC');
            }
            if (!response.result.secure) {
                this.logger.warn('Security issues found for rune:', runeId, response.result.issues);
            }
            return response.result;
        }
        catch (error) {
            this.logger.error('Failed to check security:', error);
            if (error instanceof Error && error.message === 'Invalid response from RPC') {
                throw error;
            }
            throw new Error('Failed to check security');
        }
    }
}
exports.RunesSecurityService = RunesSecurityService;
