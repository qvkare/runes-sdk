export enum BalanceChangeType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  TRADE = 'TRADE',
  FEE = 'FEE',
  TRANSFER = 'TRANSFER',
}

export interface BalanceUpdate {
  asset: string;
  free: number;
  locked: number;
  total: number;
  updateTime: number;
  crossWalletBalance?: number;
  balanceChange?: number;
  changeType?: BalanceChangeType;
}

export interface AccountUpdate {
  makerCommission: number;
  takerCommission: number;
  buyerCommission: number;
  sellerCommission: number;
  canTrade: boolean;
  canWithdraw: boolean;
  canDeposit: boolean;
  updateTime: number;
  accountType: string;
  balances: BalanceUpdate[];
  permissions: string[];
}

export interface AccountPosition {
  accountId: string;
  balances: BalanceUpdate[];
  positions: {
    symbol: string;
    positionAmount: number;
    entryPrice: number;
    unrealizedPnL: number;
    marginType: string;
    isolatedMargin?: number;
    leverage: number;
  }[];
  updateTime: number;
}
