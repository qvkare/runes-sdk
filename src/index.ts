import { APIService } from './services';
import {
  SDKConfig,
  RuneInfo,
  RuneBalance,
  RuneTransaction,
  RuneStats,
  ValidationResult,
  SearchResult,
  PaginatedResponse,
  SearchOptions,
  PaginationOptions,
} from './types';

export * from './types';

export class RunesSDK {
  private readonly api: APIService;

  constructor(config: SDKConfig) {
    this.api = new APIService(config);
  }

  async getRune(id: string): Promise<RuneInfo> {
    return this.api.getRune(id);
  }

  async getRuneBalance(address: string, rune: string): Promise<RuneBalance> {
    return this.api.getRuneBalance(address, rune);
  }

  async getRuneHistory(rune: string): Promise<RuneTransaction[]> {
    return this.api.getRuneHistory(rune);
  }

  async listRunes(options?: PaginationOptions): Promise<PaginatedResponse<RuneInfo>> {
    return this.api.listRunes(options);
  }

  async getRuneStats(rune: string): Promise<RuneStats> {
    return this.api.getRuneStats(rune);
  }

  async validateRuneTransaction(txHex: string): Promise<ValidationResult> {
    return this.api.validateRuneTransaction(txHex);
  }

  async searchRunes(options: SearchOptions): Promise<SearchResult> {
    return this.api.searchRunes(options);
  }
} 