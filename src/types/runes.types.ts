/**
 * Temel tip tanımlamaları
 */

// Runes veri yapısı
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

// Runes bakiye bilgisi
export interface RunesBalance {
  address: string;      
  runes: string;        
  amount: bigint;      
  lastUpdated: number;   
}

// Runes transfer detayları
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

// Runes operasyon tipleri
export enum RunesOperationType {
  TRANSFER = 'transfer',
  MINT = 'mint',
  BURN = 'burn'
}

// Runes operasyon detayları
export interface RunesOperation {
  type: RunesOperationType;
  runes: string;
  amount: bigint;
  from?: string;
  to?: string;
}

// Validasyon sonucu
export interface RunesValidationResult {
  valid: boolean;
  operations: RunesOperation[];
  errors?: string[];
}

// Performans metrikleri
export interface PerformanceMetrics {
  averageResponseTime: number;
  successRate: number;
  errorRate: number;
  throughput: number;
  activeConnections: number;
}

// Güvenlik yapılandırması
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

// Likidite havuzu
export interface LiquidityPool {
  runeId: string;
  totalLiquidity: bigint;
  providers: Map<string, bigint>;
}

// Havuz istatistikleri
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

// Market making yapılandırması
export interface MarketMakingConfig {
  spreadPercentage: number;
  maxOrderSize: bigint;
  minOrderSize: bigint;
  priceUpdateInterval: number;
  maxPriceDeviation: number;
}

// Güvenlik kontrolü sonucu
export interface SecurityCheck {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
}

// Transfer riski
export interface TransferRisk {
  level: 'low' | 'medium' | 'high';
  factors: string[];
  recommendations: string[];
}

// Batch işlem sonucu
export interface BatchProcessResult {
  totalTransfers: number;
  successfulTransfers: number;
  failedTransfers: number;
  errors: Array<{
    txid: string;
    error: string;
  }>;
}

// Runes transfer isteği
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