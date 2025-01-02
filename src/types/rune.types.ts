/**
 * Basic type definitions
 */

// Runes data structure
export interface Runes {
  id: string;
  symbol: string;
  decimals: number;
  supply: bigint;
  limit?: bigint;
  minted: bigint;
  burned: bigint;
  timestamp: number;
  creator: string;
  mintable: boolean;
  transferable: boolean;
}

// Runes balance information
export interface RunesBalance {
  address: string;
  runes: string;
  amount: bigint;
  lastUpdated: number;
}

// Runes transfer details
export interface RunesTransfer {
  txid: string;
  runes: string;
  amount: string;
  from: string;
  to: string;
  timestamp: number;
  blockHeight: number;
  status: 'pending' | 'confirmed' | 'failed';
}

// Runes operation types
export enum RunesOperationType {
  TRANSFER = 'transfer',
  MINT = 'mint',
  BURN = 'burn',
}

// Runes operation details
export interface RunesOperation {
  type: RunesOperationType;
  runes: string;
  amount: bigint;
  from?: string;
  to?: string;
}

// Performance metrics
export interface PerformanceMetrics {
  averageResponseTime: number;
  successRate: number;
  errorRate: number;
  throughput: number;
  activeConnections: number;
}

// Security configuration
export interface SecurityConfig {
  maxTransferAmount: bigint;
  minConfirmations: number;
  allowedAddresses: Set<string>;
  blacklistedAddresses: Set<string>;
  rateLimit: {
    maxTransfersPerBlock: number;
    maxVolumePerBlock: bigint;
  };
}

// Liquidity pool
export interface LiquidityPool {
  runeId: string;
  totalLiquidity: bigint;
  providers: Map<string, bigint>;
}

// Pool statistics
export interface PoolStats {
  totalVolume24h: bigint;
  totalTrades24h: number;
  averageTradeSize: bigint;
  priceImpact: number;
  slippage: number;
  currentPrice: bigint;
  marketMakerAddress: string;
  totalLiquidity: bigint;
  providerCount: number;
}

// Market making configuration
export interface MarketMakingConfig {
  spreadPercentage: number;
  maxOrderSize: bigint;
  minOrderSize: bigint;
  priceUpdateInterval: number;
  maxPriceDeviation: number;
}

// Security check result
export interface SecurityCheck {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
}

// Transfer risk
export interface TransferRisk {
  level: 'low' | 'medium' | 'high';
  factors: string[];
  recommendations: string[];
}

// Batch process result
export interface BatchProcessResult {
  successful: Array<{
    transfer: BatchTransfer;
    txid: string;
  }>;
  failed: Array<{
    transfer: BatchTransfer;
    error: Error;
  }>;
  totalTransfers: number;
  successfulTransfers: number;
  failedTransfers: number;
  errors: Error[];
}

// Runes transfer request
export interface RunesTransferRequest {
  runes: string;
  amount: bigint;
  from: string;
  to: string;
}

export interface RunesTransferParams {
  runes: string;
  amount: bigint;
  from: string;
  to: string;
}

export interface BatchTransferResult {
  id: string;
  txid: string;
  status: 'success' | 'failed';
  error?: string;
}

export interface RunesStats {
  totalTransfers: number;
  totalVolume: string;
  averageAmount: string;
  largestAmount: string;
  smallestAmount: string;
  timeRange: {
    start: number;
    end: number;
  };
}

export interface RunesInfo {
  id: string;
  name: string;
  symbol: string;
  totalSupply: string;
  circulatingSupply: string;
  creator: string;
  createdAt: number;
}

export interface RuneInfo {
  id: string;
  name: string;
  symbol: string;
  totalSupply: string;
  circulatingSupply: string;
  creator: string;
  createdAt: number;
}

export interface RuneBalance {
  runeId: string;
  address: string;
  balance: string;
  lastUpdated: number;
}

export interface RuneTransaction {
  id: string;
  txid: string;
  type: string;
  amount: string;
  fee: string;
  confirmations: number;
  blockHash?: string;
  blockHeight?: number;
  timestamp?: number;
}

export interface RuneStats {
  runeId: string;
  price: string;
  volume24h: string;
  marketCap: string;
  priceChange24h: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  operations?: any[];
}

export interface SearchResult {
  id: string;
  type: string;
  score: number;
  data: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SearchOptions {
  query: string;
  type?: string;
  limit?: number;
}

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface RuneTransfer {
  id: string;
  runeId: string;
  sender: string;
  recipient: string;
  amount: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
}

export interface BatchTransfer {
  token: string;
  amount: string;
  sender: string;
  recipient: string;
}

export interface BatchProcessResult {
  successful: Array<{
    transfer: BatchTransfer;
    txid: string;
  }>;
  failed: Array<{
    transfer: BatchTransfer;
    error: Error;
  }>;
  totalTransfers: number;
  successfulTransfers: number;
  failedTransfers: number;
  errors: Error[];
}

export interface RuneCreateParams {
  name: string;
  supply: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface RuneTransferParams {
  runeId: string;
  recipient: string;
  amount: string;
  memo?: string;
}

export interface BatchTransfer {
  token: string;
  amount: string;
  recipient: string;
}

export interface BatchTransferResult {
  successful: BatchTransfer[];
  failed: BatchTransfer[];
  totalTransfers: number;
  successfulTransfers: number;
  failedTransfers: number;
  errors: Error[];
}

export interface RunePermissions {
  runeId: string;
  canMint: boolean;
  canBurn: boolean;
  canTransfer: boolean;
  canModifyPermissions: boolean;
}

export interface RuneAccessResult {
  hasAccess: boolean;
  permissions?: RunePermissions;
}

export interface RuneMetrics {
  runeId: string;
  totalTransfers: number;
  uniqueHolders: number;
  averageTransferAmount: string;
  largestTransfer: string;
  lastTransferTimestamp: number;
}

export interface NetworkStats {
  connectedPeers: number;
  inboundConnections: number;
  outboundConnections: number;
  bandwidthUsage: number;
  networkVersion: string;
}

export interface SystemResources {
  totalMemory: number;
  freeMemory: number;
  cpuCores: number;
  diskSpace: number;
  uptime: number;
}
