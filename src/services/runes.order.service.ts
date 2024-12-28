import { RPCClient } from '../utils/rpc.client';
import { Logger } from '../utils/logger';

interface OrderBook {
  runesId: string;
  buyOrders: Order[];
  sellOrders: Order[];
}

interface Order {
  id: string;
  runesId: string;
  price: bigint;
  amount: bigint;
  type: 'buy' | 'sell';
  timestamp: number;
  address: string;
  status: 'pending' | 'completed' | 'cancelled';
}

interface OperationMetrics {
  totalCount: number;
  successCount: number;
  failureCount: number;
  totalDuration: number;
  averageDuration: number;
}

interface BatchStats {
  totalBatches: number;
  successfulBatches: number;
  failedBatches: number;
}

export class RunesOrderService extends Logger {
  private orders: Map<string, Order> = new Map();
  private orderBooks: Map<string, OrderBook> = new Map();
  private metrics: Map<string, OperationMetrics> = new Map();
  private batchStats: BatchStats = {
    totalBatches: 0,
    successfulBatches: 0,
    failedBatches: 0
  };

  constructor(private readonly rpcClient: RPCClient) {
    super('RunesOrderService');
  }

  async placeOrder(order: Omit<Order, 'id' | 'timestamp' | 'status'>): Promise<string> {
    // Validate order
    this.validateOrder(order);

    // Generate unique order ID
    const orderId = this.generateOrderId();
    const newOrder: Order = {
      ...order,
      id: orderId,
      timestamp: Date.now(),
      status: 'pending'
    };

    // Store order
    this.orders.set(orderId, newOrder);

    // Try to match order
    this.matchOrder(newOrder);

    // Update order book if not fully matched
    if (this.orders.has(orderId)) {
      this.updateOrderBook(newOrder);
    }

    return orderId;
  }

  getOrder(orderId: string): Order | undefined {
    return this.orders.get(orderId);
  }

  async cancelOrder(orderId: string): Promise<void> {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status === 'completed') {
      throw new Error('Cannot cancel order in completed status');
    }

    order.status = 'cancelled';
    this.orders.set(orderId, order);

    // Remove from order book
    const orderBook = this.orderBooks.get(order.runesId);
    if (orderBook) {
      if (order.type === 'buy') {
        orderBook.buyOrders = orderBook.buyOrders.filter(o => o.id !== orderId);
      } else {
        orderBook.sellOrders = orderBook.sellOrders.filter(o => o.id !== orderId);
      }
    }
  }

  getOrderBook(runesId: string): OrderBook {
    let orderBook = this.orderBooks.get(runesId);
    if (!orderBook) {
      orderBook = {
        runesId,
        buyOrders: [],
        sellOrders: []
      };
      this.orderBooks.set(runesId, orderBook);
    }
    return orderBook;
  }

  getAddressOrders(address: string): Order[] {
    return Array.from(this.orders.values())
      .filter(order => order.address === address);
  }

  recordMetrics(operation: string, duration: number, success: boolean): void {
    let metrics = this.metrics.get(operation);
    if (!metrics) {
      metrics = {
        totalCount: 0,
        successCount: 0,
        failureCount: 0,
        totalDuration: 0,
        averageDuration: 0
      };
    }

    metrics.totalCount++;
    metrics.totalDuration += duration;
    metrics.averageDuration = metrics.totalDuration / metrics.totalCount;

    if (success) {
      metrics.successCount++;
    } else {
      metrics.failureCount++;
    }

    this.metrics.set(operation, metrics);

    // Update batch stats if this is a batch operation
    if (operation === 'batch_processing') {
      this.batchStats.totalBatches++;
      if (success) {
        this.batchStats.successfulBatches++;
      } else {
        this.batchStats.failedBatches++;
      }
    }
  }

  private validateOrder(order: Omit<Order, 'id' | 'timestamp' | 'status'>): void {
    if (!order.runesId || !order.address || !order.amount || !order.type) {
      throw new Error('Invalid order: missing required fields');
    }

    if (order.amount <= BigInt(0)) {
      throw new Error('Invalid order: amount must be positive');
    }

    if (order.price <= BigInt(0)) {
      throw new Error('Invalid order: price must be positive');
    }

    if (order.type !== 'buy' && order.type !== 'sell') {
      throw new Error('Invalid order: type must be buy or sell');
    }
  }

  private generateOrderId(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }

  private matchOrder(order: Order): void {
    const orderBook = this.getOrderBook(order.runesId);
    const matchingOrders = order.type === 'buy' ? orderBook.sellOrders : orderBook.buyOrders;

    for (const matchingOrder of matchingOrders) {
      if (order.type === 'buy' && order.price >= matchingOrder.price ||
          order.type === 'sell' && order.price <= matchingOrder.price) {
        
        // Match orders
        const matchAmount = order.amount < matchingOrder.amount ? order.amount : matchingOrder.amount;
        
        // Update amounts
        order.amount -= matchAmount;
        matchingOrder.amount -= matchAmount;

        // Update statuses
        if (matchingOrder.amount === BigInt(0)) {
          matchingOrder.status = 'completed';
          this.orders.delete(matchingOrder.id);
          if (order.type === 'buy') {
            orderBook.sellOrders = orderBook.sellOrders.filter(o => o.id !== matchingOrder.id);
          } else {
            orderBook.buyOrders = orderBook.buyOrders.filter(o => o.id !== matchingOrder.id);
          }
        }

        if (order.amount === BigInt(0)) {
          order.status = 'completed';
          this.orders.delete(order.id);
          return;
        }
      }
    }
  }

  private updateOrderBook(order: Order): void {
    const orderBook = this.getOrderBook(order.runesId);
    if (order.type === 'buy') {
      orderBook.buyOrders.push(order);
      orderBook.buyOrders.sort((a, b) => Number(b.price - a.price));
    } else {
      orderBook.sellOrders.push(order);
      orderBook.sellOrders.sort((a, b) => Number(a.price - b.price));
    }
  }
} 