export interface BitcoinRpcConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  timeout?: number;
  network?: 'mainnet' | 'testnet' | 'regtest';
}

export interface BitcoinTransaction {
  txid: string;
  hash: string;
  version: number;
  size: number;
  vsize: number;
  weight: number;
  locktime: number;
  vin: BitcoinTxInput[];
  vout: BitcoinTxOutput[];
  hex: string;
  blockhash?: string;
  confirmations?: number;
  time?: number;
  blocktime?: number;
}

export interface BitcoinTxInput {
  txid: string;
  vout: number;
  scriptSig: {
    asm: string;
    hex: string;
  };
  sequence: number;
  witness?: string[];
}

export interface BitcoinTxOutput {
  value: number;
  n: number;
  scriptPubKey: {
    asm: string;
    hex: string;
    reqSigs?: number;
    type: string;
    addresses?: string[];
  };
}
