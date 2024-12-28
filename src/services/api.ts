import { SDKConfig, RuneInfo, RuneBalance, RuneTransaction, RuneStats, ValidationResult, SearchResult, PaginatedResponse, SearchOptions, PaginationOptions } from '../types';

export class APIService {
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly retryAttempts: number;

  constructor(config: SDKConfig) {
    this.baseUrl = `${config.ordServer}/api/v1`;
    this.timeout = config.timeout || 30000;
    this.retryAttempts = config.retryAttempts || 3;
  }

  private async fetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async getRune(id: string): Promise<RuneInfo> {
    return this.fetch<RuneInfo>(`/runes/${id}`);
  }

  async getRuneBalance(address: string, rune: string): Promise<RuneBalance> {
    return this.fetch<RuneBalance>(`/address/${address}/runes/${rune}`);
  }

  async getRuneHistory(rune: string): Promise<RuneTransaction[]> {
    return this.fetch<RuneTransaction[]>(`/runes/${rune}/history`);
  }

  async listRunes(options?: PaginationOptions): Promise<PaginatedResponse<RuneInfo>> {
    return this.fetch<PaginatedResponse<RuneInfo>>('/runes', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: options ? JSON.stringify(options) : undefined,
    });
  }

  async getRuneStats(rune: string): Promise<RuneStats> {
    return this.fetch<RuneStats>(`/runes/${rune}/stats`);
  }

  async validateRuneTransaction(txHex: string): Promise<ValidationResult> {
    return this.fetch<ValidationResult>('/runes/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ txHex }),
    });
  }

  async searchRunes(options: SearchOptions): Promise<SearchResult> {
    return this.fetch<SearchResult>('/runes/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });
  }
} 