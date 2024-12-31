export interface TransactionHistory {
  transactions: Array<{
    txid: string;
    timestamp: number;
    amount: string;
    type: string;
  }>;
  totalCount: number;
}

export interface TransactionDetails {
  txid: string;
  timestamp: number;
  confirmations: number;
  amount: string;
  fee: string;
  status: string;
}

export interface TransactionHistoryItem {
  txid: string;
  type: string;
  amount: string;
  runeId: string;
  timestamp: number;
  confirmations: number;
  from: string;
  to: string;
  status: string;
} 