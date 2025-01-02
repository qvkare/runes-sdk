import { OrderSide } from './market.types';

export enum PositionSide {
  LONG = 'LONG',
  SHORT = 'SHORT',
  BOTH = 'BOTH',
}

export enum MarginType {
  ISOLATED = 'ISOLATED',
  CROSS = 'CROSS',
}

export interface PositionUpdate {
  symbol: string;
  positionSide: PositionSide;
  marginType: MarginType;
  leverage: number;
  entryPrice: number;
  markPrice: number;
  unrealizedPnL: number;
  liquidationPrice: number;
  marginRatio: number;
  isolatedMargin?: number;
  crossMargin?: number;
  maintenanceMargin: number;
  marginBalance: number;
  timestamp: number;
  notional: number;
  isAutoAddMargin: boolean;
}

export interface FundingRateUpdate {
  symbol: string;
  markPrice: number;
  indexPrice: number;
  estimatedSettlePrice: number;
  lastFundingRate: number;
  nextFundingTime: number;
  interestRate: number;
  timestamp: number;
}
