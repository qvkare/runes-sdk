/**
 * Bitcoin Core RPC configuration interface
 */
export interface BitcoinConfig {
    /** Bitcoin Core RPC URL */
    rpcUrl: string;
    /** Bitcoin network type */
    network: 'mainnet' | 'testnet' | 'regtest';
    /** RPC username */
    username: string;
    /** RPC password */
    password: string;
    /** Request timeout in milliseconds */
    timeout?: number;
    /** Maximum retry attempts for failed requests */
    maxRetries?: number;
    /** Retry delay in milliseconds */
    retryDelay?: number;
}
/**
 * Default Bitcoin configuration values
 */
export declare const defaultBitcoinConfig: Partial<BitcoinConfig>;
/**
 * Validates Bitcoin configuration
 * @param config Partial Bitcoin configuration
 * @returns Complete Bitcoin configuration with defaults
 * @throws Error if required fields are missing
 */
export declare function validateBitcoinConfig(config: Partial<BitcoinConfig>): BitcoinConfig;
