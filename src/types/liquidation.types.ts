import { OrderSide } from './market.types';

export enum LiquidationType {
  FORCED = 'FORCED',
  AUTO = 'AUTO',
  MANUAL = 'MANUAL',
}

export interface LiquidationEvent {
  symbol: string;
  side: 'BUY' | 'SELL';
  type: LiquidationType;
  price: number;
  quantity: number;
  timestamp: number;
  liquidatedPositionId: string;
  liquidatedUserId: string;
}
