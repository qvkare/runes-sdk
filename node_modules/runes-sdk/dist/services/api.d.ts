import { SDKConfig } from '../types/config';
import { RuneInfo, RuneBalance, RuneTransaction, RuneStats, ValidationResult, SearchResult, PaginatedResponse, SearchOptions, PaginationOptions } from '../types/rune.types';
export declare class APIService {
    private readonly baseUrl;
    private readonly timeout;
    private readonly retryAttempts;
    constructor(config: SDKConfig);
    private fetch;
    getRune(id: string): Promise<RuneInfo>;
    getRuneBalance(address: string, rune: string): Promise<RuneBalance>;
    getRuneHistory(rune: string): Promise<RuneTransaction[]>;
    listRunes(options?: PaginationOptions): Promise<PaginatedResponse<RuneInfo>>;
    getRuneStats(rune: string): Promise<RuneStats>;
    validateRuneTransaction(txHex: string): Promise<ValidationResult>;
    searchRunes(options: SearchOptions): Promise<SearchResult>;
}
