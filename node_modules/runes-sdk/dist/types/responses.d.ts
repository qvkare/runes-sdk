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
    txid: string;
    rune: string;
    from: string;
    to: string;
    amount: string;
    timestamp: number;
    blockHeight: number;
    status: 'pending' | 'confirmed' | 'failed';
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
    data: RuneInfo[];
    total: number;
}
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    pages: number;
}
