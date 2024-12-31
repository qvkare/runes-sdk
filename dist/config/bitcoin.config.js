"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBitcoinConfig = exports.defaultBitcoinConfig = void 0;
/**
 * Default Bitcoin configuration values
 */
exports.defaultBitcoinConfig = {
    timeout: 30000,
    maxRetries: 3
};
/**
 * Validates Bitcoin configuration
 * @param config Partial Bitcoin configuration
 * @returns Complete Bitcoin configuration with defaults
 * @throws Error if required fields are missing
 */
function validateBitcoinConfig(config) {
    if (!config.rpcUrl) {
        throw new Error('Bitcoin RPC URL is required');
    }
    if (!config.network) {
        throw new Error('Bitcoin network type is required');
    }
    if (!config.username || !config.password) {
        throw new Error('Bitcoin RPC credentials are required');
    }
    return {
        ...exports.defaultBitcoinConfig,
        ...config
    };
}
exports.validateBitcoinConfig = validateBitcoinConfig;
