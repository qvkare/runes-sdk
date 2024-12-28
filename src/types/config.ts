export interface SDKConfig {
  ordServer: string;
  network: 'mainnet' | 'testnet';
  timeout?: number;
  retryAttempts?: number;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

export interface SearchOptions {
  query: string;
  type?: string;
  status?: string;
  sort?: string;
  order?: 'asc' | 'desc';
} 