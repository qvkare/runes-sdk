/**
 * RPC Error response interface
 */
export interface RPCErrorResponse {
  code: number;
  message: string;
}

/**
 * RPC Success response interface
 */
export interface RPCResponse<T> {
  result: T;
  error?: RPCErrorResponse;
  id: number;
  jsonrpc: string;
}

/**
 * Block info interface
 */
export interface BlockInfo {
  hash: string;
  height: number;
  time: number;
  previousblockhash: string;
  nextblockhash?: string;
  size: number;
  weight: number;
  confirmations: number;
}

/**
 * Transaction info interface
 */
export interface TransactionInfo {
  txid: string;
  hash: string;
  version: number;
  size: number;
  vsize: number;
  weight: number;
  locktime: number;
  vin: TransactionInput[];
  vout: TransactionOutput[];
  hex: string;
  blockhash: string;
  confirmations: number;
  time: number;
  blocktime: number;
}

/**
 * Transaction input interface
 */
export interface TransactionInput {
  txid: string;
  vout: number;
  scriptSig: {
    asm: string;
    hex: string;
  };
  sequence: number;
  witness?: string[];
}

/**
 * Transaction output interface
 */
export interface TransactionOutput {
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

/**
 * Network info interface
 */
export interface NetworkInfo {
  version: number;
  subversion: string;
  protocolversion: number;
  localservices: string;
  localrelay: boolean;
  timeoffset: number;
  connections: number;
  networkactive: boolean;
  networks: Network[];
  relayfee: number;
  incrementalfee: number;
}

/**
 * Network interface
 */
export interface Network {
  name: string;
  limited: boolean;
  reachable: boolean;
  proxy: string;
  proxy_randomize_credentials: boolean;
}

export interface RPCClientConfig {
  url: string;
  auth: {
    username: string;
    password: string;
  };
}

export interface RPCResponse<T = any> {
  result: T;
  error: null | {
    code: number;
    message: string;
  };
  id: string | number;
}
