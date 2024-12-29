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
  BURN = 'burn'
}

// Runes operation details
export interface RunesOperation {
  type: RunesOperationType;
  runes: string;
  amount: bigint;
  from?: string;
  to?: string;
}

// Validation result
export interface RunesValidationResult {
  valid: boolean;
  operations: RunesOperation[];
  errors?: string[];
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
  totalTransfers: number;
  successfulTransfers: number;
  failedTransfers: number;
  errors: Array<{
    txid: string;
    error: string;
  }>;
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
  holders: number;
  transfers: number;
}

export interface RuneInfo {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  circulatingSupply: string;
  creator: string;
  createdAt: number;
}

export interface RuneBalance {
  runeId: string;
  amount: string;
  lastUpdated: number;
}

export interface RuneTransaction {
  txid: string;
  runeId: string;
  type: string;
  amount: string;
  from: string;
  to: string;
  timestamp: number;
  status: string;
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
  errors?: string[];
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