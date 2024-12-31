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
export const defaultBitcoinConfig: Partial<BitcoinConfig> = {
  timeout: 30000,
  maxRetries: 3
};

/**
 * Validates Bitcoin configuration
 * @param config Partial Bitcoin configuration
 * @returns Complete Bitcoin configuration with defaults
 * @throws Error if required fields are missing
 */
export function validateBitcoinConfig(config: Partial<BitcoinConfig>): BitcoinConfig {
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
    ...defaultBitcoinConfig,
    ...config
  } as BitcoinConfig;
} 