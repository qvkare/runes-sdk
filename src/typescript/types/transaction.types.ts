export interface Transaction {
    txid: string;
    blockHeight?: number;
    confirmations: number;
    timestamp: number;
    type: TransactionType;
}

export enum TransactionType {
    MINT = 'mint',
    TRANSFER = 'transfer',
    BURN = 'burn'
} 