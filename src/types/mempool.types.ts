export interface MempoolTransaction {
  txid: string;
  size: number;
  fee: number;
  time: number;
  height?: number;
  descendantcount?: number;
  descendantsize?: number;
  descendantfees?: number;
  ancestorcount?: number;
  ancestorsize?: number;
  ancestorfees?: number;
}

export interface MempoolConfig {
  maxWatchTime: number;
  checkInterval: number;
  maxRetries: number;
  requiredConfirmations: number;
}

export interface TransactionStatus {
  confirmed: boolean;
  blockHeight?: number;
  confirmations: number;
  timestamp: number;
}

export interface TransactionStatusInfo {
  status: TransactionStatus;
  confirmations: number;
  lastChecked: number;
  replacedBy?: string;
}

export interface RawTransaction {
  txid: string;
  hash: string;
  version: number;
  size: number;
  vsize: number;
  weight: number;
  locktime: number;
  vin: any[];
  vout: any[];
  hex: string;
  confirmations?: number;
  bip125_replaceable?: 'yes' | 'no' | 'unknown';
}

export class MempoolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MempoolError';
  }
}
