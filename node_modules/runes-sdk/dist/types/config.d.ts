import { Logger } from '../utils/logger';
export interface SDKConfig {
    ordServer: string;
    retryAttempts?: number;
    timeout?: number;
    logger?: Logger;
    network?: string;
    apiKey?: string;
    apiSecret?: string;
    maxConcurrentRequests?: number;
    cacheEnabled?: boolean;
    cacheTTL?: number;
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
