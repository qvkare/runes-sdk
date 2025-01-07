export interface Transaction {
    txid: string;
    type: TransactionType;
    amount: string;
    from?: string;
    to?: string;
    sender?: string;
    recipient?: string;
    timestamp: number;
    time?: number;
    confirmations: number;
    blockHash?: string;
    blockHeight?: number;
    fee?: string;
    hex?: string;
    size?: number;
    version?: number;
    token?: string;
    price?: string;
}

export enum TransactionType {
    TRANSFER = 'transfer',
    MINT = 'mint',
    BURN = 'burn',
    LIQUIDITY = 'liquidity',
    ORDER = 'order'
}

export interface TransactionValidationResult {
    isValid: boolean;
    errors: string[];
}

export interface BatchTransactionResult {
    success: boolean;
    txid?: string;
    error?: string;
    failed?: string[];
}
