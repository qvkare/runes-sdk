export interface RuneTransaction {
  txid: string;
  type: 'create' | 'transfer';
  timestamp: number;
  details: {
    runeId: string;
    amount: number;
    from?: string;
    to?: string;
    symbol?: string;
    decimals?: number;
    supply?: number;
    limit?: number;
  };
}

export interface RuneHistory {
  transactions: RuneTransaction[];
  total: number;
}

export interface AddressHistory {
  transactions: RuneTransaction[];
  total: number;
}
