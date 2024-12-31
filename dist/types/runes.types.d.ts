/**
 * Temel tip tanımlamaları
 */
export interface Runes {
    id: string;
    symbol: string;
    decimals: number;
    supply: bigint;
    limit?: bigint;
    minted: bigint;
    burned: bigint;
    timestamp: number;
    creator: string;
    mintable: boolean;
    transferable: boolean;
}
export interface RunesBalance {
    address: string;
    runes: string;
    amount: bigint;
    lastUpdated: number;
}
export interface RunesTransfer {
    txid: string;
    runes: string;
    amount: string;
    from: string;
    to: string;
    timestamp: number;
    blockHeight: number;
    status: 'pending' | 'confirmed' | 'failed';
}
export declare enum RunesOperationType {
    TRANSFER = "transfer",
    MINT = "mint",
    BURN = "burn"
}
export interface RunesOperation {
    type: RunesOperationType;
    runes: string;
    amount: bigint;
    from?: string;
    to?: string;
}
export interface RunesValidationResult {
    valid: boolean;
    operations: RunesOperation[];
    errors?: string[];
}
export interface PerformanceMetrics {
    tps: number;
    avgConfirmationTime: number;
    successRate: number;
    activeWallets: number;
    timestamp: number;
}
export interface SecurityConfig {
    maxTransferAmount: bigint;
    minConfirmations: number;
    allowedAddresses: Set<string>;
    blacklistedAddresses: Set<string>;
    rateLimit: {
        maxTransfersPerBlock: number;
        maxVolumePerBlock: bigint;
    };
}
export interface LiquidityPool {
    poolId: string;
    runeId: string;
    totalLiquidity: string;
    providers: number;
    apy: number;
    volume24h: string;
}
export interface PoolStats {
    totalVolume24h: bigint;
    totalTrades24h: number;
    averageTradeSize: bigint;
    priceImpact: number;
    slippage: number;
    currentPrice: bigint;
    marketMakerAddress: string;
    totalLiquidity: bigint;
    providerCount: number;
}
export interface MarketMakingConfig {
    spreadPercentage: number;
    maxOrderSize: bigint;
    minOrderSize: bigint;
    priceUpdateInterval: number;
    maxPriceDeviation: number;
}
export interface SecurityCheck {
    isValid: boolean;
    errors?: string[];
    warnings?: string[];
}
export interface TransferRisk {
    level: 'low' | 'medium' | 'high';
    factors: string[];
    recommendations: string[];
}
export interface BatchProcessResult {
    totalTransfers: number;
    successfulTransfers: number;
    failedTransfers: number;
    errors: Array<{
        txid: string;
        error: string;
    }>;
}
export interface RunesTransferRequest {
    runes: string;
    amount: bigint;
    from: string;
    to: string;
}
export interface RunesTransferParams {
    runes: string;
    amount: bigint;
    from: string;
    to: string;
}
export interface BatchTransferResult {
    id: string;
    txid: string;
    status: 'success' | 'failed';
    error?: string;
}
export interface RunesStats {
    totalTransfers: number;
    totalVolume: string;
    averageAmount: string;
    largestAmount: string;
    smallestAmount: string;
    timeRange: {
        start: number;
        end: number;
    };
}
export interface RunesInfo {
    id: string;
    name: string;
    symbol: string;
    totalSupply: string;
    circulatingSupply: string;
    holders: number;
    transfers: number;
}
export interface RunePerformanceStats {
    totalSupply: string;
    circulatingSupply: string;
    holders: number;
    transactions: number;
}
export interface RuneTransaction {
    txId: string;
    runeId: string;
    amount: string;
    from: string;
    to: string;
    timestamp: number;
    confirmations: number;
    status: 'pending' | 'confirmed' | 'failed';
}
export interface OrderResult {
    orderId: string;
    status: 'open' | 'filled' | 'cancelled';
    filledAmount: string;
    remainingAmount: string;
    price: string;
    timestamp: number;
}
export interface TransactionHistory {
    txId: string;
    type: 'transfer' | 'mint' | 'burn';
    amount: string;
    from: string;
    to: string;
    timestamp: number;
    confirmations: number;
    status: 'pending' | 'confirmed' | 'failed';
}
