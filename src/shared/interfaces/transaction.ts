export interface SharedTransaction {
    txid: string;
    blockHeight?: number;
    confirmations: number;
    timestamp: number;
}

export interface SharedRuneTransfer {
    runeId: string;
    fromAddress: string;
    toAddress: string;
    amount: string;
    type: 'mint' | 'transfer' | 'burn';
} 