export interface MempoolFilter {
  addresses?: string[];
  minAmount?: number;
  scriptTypes?: string[];
}

export interface MempoolEntry {
  size: number;
  fee: number;
  modifiedfee: number;
  time: number;
  height: number;
  descendantcount: number;
  descendantsize: number;
  descendantfees: number;
  ancestorcount: number;
  ancestorsize: number;
  ancestorfees: number;
  wtxid: string;
  fees: {
    base: number;
    modified: number;
    ancestor: number;
    descendant: number;
  };
  depends: string[];
  spentby: string[];
  'bip125-replaceable': boolean;
  unbroadcast: boolean;
}

export interface MempoolInfo {
  loaded: boolean;
  size: number;
  bytes: number;
  usage: number;
  maxmempool: number;
  mempoolminfee: number;
  minrelaytxfee: number;
  unbroadcastcount: number;
}

export interface MempoolTransaction {
  txid: string;
  hash: string;
  version: number;
  size: number;
  vsize: number;
  weight: number;
  locktime: number;
  vin: Array<{
    txid: string;
    vout: number;
    scriptSig: {
      asm: string;
      hex: string;
    };
    sequence: number;
  }>;
  vout: Array<{
    value: number;
    n: number;
    scriptPubKey: {
      asm: string;
      hex: string;
      reqSigs: number;
      type: string;
      addresses: string[];
    };
  }>;
  hex: string;
  blockhash?: string;
  confirmations: number;
  time: number;
  blocktime: number;
}

export interface TransactionStatus {
  txid: string;
  status: 'confirmed' | 'unconfirmed';
  inMempool: boolean;
  timestamp: number;
  confirmations?: number;
}

export interface MempoolWatcherConfig {
  pollIntervalMs?: number;
  maxTransactions?: number;
  minConfirmations?: number;
} 