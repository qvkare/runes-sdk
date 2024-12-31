// Bitcoin types
export * from './bitcoin.types';
export * from '../config/bitcoin.config';

// SDK types
export * from './config';
export * from './responses';
export * from './rune.types';

export interface RunesTransfer {
  txid: string;
  runes: string;
  from: string;
  to: string;
  amount: string;
  timestamp: number;
  blockHeight: number;
  status: string;
}

export interface Order {
  id: string;
  amount: string;
  price: string;
  type: 'buy' | 'sell';
  status: string;
}

export interface OrderResponse {
  txid: string;
  status: string;
}

export interface OrderStatus {
  id: string;
  status: string;
  filledAmount: string;
  remainingAmount: string;
}

export interface TransactionHistory {
  transactions: Array<{
    txid: string;
    timestamp: number;
    amount: string;
    type: string;
  }>;
  totalCount: number;
}

export interface TransactionDetails {
  txid: string;
  timestamp: number;
  confirmations: number;
  amount: string;
  fee: string;
  status: string;
}

export interface BatchResult {
  successful: number;
  failed: number;
  transactions: Array<{
    txid?: string;
    error?: string;
    status?: string;
  }>;
}

export interface BatchTransfer {
  from: string;
  to: string;
  amount: bigint;
}

export interface BatchResultItem {
  index: number;
  success: boolean;
  txid?: string;
  error?: string;
}

export interface BatchProcessResult {
  txid: string;
  status: string;
  results: BatchResultItem[];
}

export interface TransactionHistoryItem {
  txid: string;
  type: string;
  amount: string;
  rune_id: string;
  timestamp: number;
  confirmations: number;
  from: string;
  to: string;
  status: string;
}

export interface LiquidityPoolResponse {
  id: string;
  runeId?: string;
  rune_id?: string;
  totalLiquidity?: string;
  total_liquidity?: string;
  totalShares?: string;
  total_shares?: string;
  createdAt?: number;
  created_at?: number;
  updatedAt?: number;
  updated_at?: number;
}

export interface PerformanceMetricsResponse {
  runeId?: string;
  rune_id?: string;
  price: string;
  volume24h?: string;
  volume_24h?: string;
  marketCap?: string;
  market_cap?: string;
  circulatingSupply?: string;
  circulating_supply?: string;
  totalSupply?: string;
  total_supply?: string;
  allTimeHigh?: string;
  all_time_high?: string;
  allTimeLow?: string;
  all_time_low?: string;
  priceChange24h?: string;
  price_change_24h?: string;
  priceChangePercentage24h?: string;
  price_change_percentage_24h?: string;
  updatedAt?: number;
  updated_at?: number;
}

export interface RPCResponse {
  jsonrpc: string;
  id: number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
  };
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