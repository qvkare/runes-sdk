/**
 * Temel tip tanımlamaları
 */

// Rune veri yapısı
export interface Rune {
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

// Rune bakiye bilgisi
export interface RuneBalance {
  address: string;      
  rune: string;        
  amount: bigint;      
  updatedAt: number;   
}

// Rune transfer detayları
export interface RuneTransfer {
  txid: string;
  rune: string;
  from: string;
  to: string;
  amount: string;
  timestamp: number;
  blockHeight: number;
  status: 'pending' | 'confirmed' | 'failed';
}

// Rune operasyon tipleri
export enum RuneOperationType {
  TRANSFER = 'transfer',
  MINT = 'mint',
  BURN = 'burn'
}

// Rune operasyon detayları
export interface RuneOperation {
  type: RuneOperationType;
  rune: string;
  amount: bigint;
  from?: string;
  to?: string;
}

// Validasyon sonucu
export interface RuneValidationResult {
  valid: boolean;
  operations: RuneOperation[];
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

// Rune transfer isteği
export interface RuneTransferRequest {
  rune: string;
  amount: bigint;
  from: string;
  to: string;
}

export interface RuneTransferParams {
  rune: string;
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