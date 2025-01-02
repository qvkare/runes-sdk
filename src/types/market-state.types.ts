export enum MarketStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  HALTED = 'HALTED',
  CLOSED = 'CLOSED',
}

export interface MarketState {
  symbol: string;
  status: MarketStatus;
  timestamp: number;
  reason?: string;
  expectedResumption?: number;
}
