import { Logger } from './utils/logger';
export interface RPCResponse<T> {
    result?: T;
    error?: {
        message: string;
    };
}
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
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
