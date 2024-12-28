export interface RuneInfo {
  id: string;
  symbol: string;
  supply: string;
  timestamp: number;
  mintable: boolean;
  metadata?: Record<string, unknown>;
}

export interface RuneBalance {
  rune: string;
  amount: string;
  address: string;
  lastUpdated: number;
}

export interface RuneTransfer {
  rune: string;
  amount: string;
  from: string;
  to: string;
  txid: string;
}

export interface RuneTransaction {
  txid: string;
  timestamp: number;
  transfers: RuneTransfer[];
  blockHeight: number;
}

export interface RuneStats {
  totalSupply: string;
  holders: number;
  transfers: number;
  lastActivity: number;
}

export interface ValidationResult {
  valid: boolean;
  transfers: RuneTransfer[];
  errors?: string[];
}

export interface SearchResult {
  items: RuneInfo[];
  total: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
} 