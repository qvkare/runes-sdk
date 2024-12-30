export enum OrderType {
  BUY = 'buy',
  SELL = 'sell',
}

export interface OrderParams {
  runeId: string;
  type: OrderType;
  amount: number;
  price: number;
  address: string;
}

export interface Order {
  orderId: string;
  runeId: string;
  type: OrderType;
  amount: number;
  price: number;
  timestamp: number;
  status?: string;
}

export interface OrderBook {
  bids: Array<{
    price: number;
    amount: number;
  }>;
  asks: Array<{
    price: number;
    amount: number;
  }>;
}

export interface OrderHistory {
  orders: Order[];
  total: number;
}
