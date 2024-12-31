import { LogLevel } from './utils/logger';
export interface RunesSDKConfig {
    rpcUrl: string;
    rpcUsername: string;
    rpcPassword: string;
    logLevel?: LogLevel;
}
export interface RPCResponse<T = any> {
    result?: T;
    error?: {
        code: number;
        message: string;
    };
}
export interface ValidationResult {
    isValid: boolean;
    error?: string;
}
export interface RunePerformanceStats {
    volume24h: number;
    price24h: number;
    transactions24h: number;
    holders: number;
    marketCap: number;
}
export interface BatchSubmissionResult {
    batchId: string;
    status: string;
    timestamp: string;
}
export interface TransactionHistory {
    txId: string;
    timestamp: string;
    type: string;
    amount: string;
    status: string;
}
export interface LiquidityPool {
    runeId: string;
    totalLiquidity: number;
    price: number;
    volume24h: number;
}
export interface Order {
    id: string;
    runeId: string;
    amount: number;
    price: number;
    type: OrderType;
    status: OrderStatus;
    createdAt: string;
}
export interface OrderParams {
    runeId: string;
    amount: string;
    price: string;
    type: OrderType;
}
export interface OrderResult {
    orderId: string;
}
export declare enum OrderType {
    BUY = "buy",
    SELL = "sell"
}
export declare enum OrderStatus {
    OPEN = "open",
    FILLED = "filled",
    CANCELLED = "cancelled"
}
export interface SDKConfig {
    baseUrl: string;
    timeout?: number;
    maxRetries?: number;
    retryDelay?: number;
    logger?: Logger;
}
export interface Logger {
    level: LogLevel;
    context: string;
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
    debug(message: string): void;
    shouldLog(level: LogLevel): boolean;
}
export interface RuneInfo {
    id: string;
    name: string;
    symbol: string;
    totalSupply: number;
    decimals: number;
    owner: string;
    metadata: Record<string, any>;
}
export interface RuneTransaction {
    txId: string;
    runeId: string;
    from: string;
    to: string;
    amount: number;
    status: string;
    timestamp: number;
    fee: number;
    metadata: Record<string, any>;
}
export interface BatchResult {
    batchId: string;
    transactions: RuneTransaction[];
    status: string;
    timestamp: number;
}
export interface Pool {
    id: string;
    runeId: string;
    liquidity: number;
    price: number;
    volume24h: number;
    createdAt: number;
}
export interface Metrics {
    totalTransactions: number;
    activeUsers: number;
    totalVolume: number;
    averageTransactionSize: number;
}
export interface SecurityVerification {
    isValid: boolean;
    issues: string[];
    riskLevel: 'low' | 'medium' | 'high';
}
export interface SecurityCheck {
    isSecure: boolean;
    vulnerabilities: string[];
    recommendations: string[];
}
export interface Transfer {
    runeId: string;
    from: string;
    to: string;
    amount: number;
}
