export interface SDKConfig {
  ordServer: string;
  network: 'mainnet' | 'testnet';
  timeout?: number;
  retryAttempts?: number;
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

export interface SearchOptions {
  term: string;
  field?: 'id' | 'symbol';
  includeMetadata?: boolean;
} 