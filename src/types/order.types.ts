export interface CreateOrderParams {
  runeId: string;
  amount: number;
  price: number;
  type: 'buy' | 'sell';
  sender: string;
  recipient: string;
}

export interface CancelOrderParams {
  orderId: string;
}

export interface Order {
  orderId: string;
  runeId: string;
  amount: number;
  price: number;
  type: 'buy' | 'sell';
  status: 'open' | 'filled' | 'cancelled';
  timestamp: number;
  sender: string;
  recipient: string;
}

export interface OrderStatus {
  orderId: string;
  status: 'open' | 'filled' | 'cancelled';
  filledAmount?: number;
  remainingAmount?: number;
  timestamp: number;
}
