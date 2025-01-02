import { Logger } from './logger.types';
import { RateLimitConfig } from './ratelimit.types';
import { MempoolConfig } from './mempool.types';
import { SecurityConfig } from './security.types';

export interface SDKConfig {
  host: string;
  username: string;
  password: string;
  ordServer: string;
  timeout?: number;
  retryAttempts?: number;
  logger?: Logger;
  clientId?: string;
  validationConfig?: ValidationConfig;
  rateLimitConfig?: RateLimitConfig;
  mempoolConfig?: MempoolConfig;
  securityConfig?: SecurityConfig;
}

export interface NetworkConfig {
  network: 'mainnet' | 'testnet' | 'regtest';
  port: number;
  timeout?: number;
  maxRetries?: number;
  retryInterval?: number;
}

export interface APIConfig {
  port: number;
  host?: string;
  cors?: boolean;
  corsOrigin?: string[];
  rateLimiting?: boolean;
  maxRequestSize?: string;
}

export interface ValidationConfig {
  minConfirmations: number;
  maxTransactionSize: number;
  minFee: string;
  maxFee: string;
  maxTransactionAmount: string;
  addressRegex: RegExp;
}

export interface Config {
  rpcUrl: string;
  rpcUsername: string;
  rpcPassword: string;
  webhookUrl?: string;
  logger?: Logger;
  validation?: ValidationConfig;
}
