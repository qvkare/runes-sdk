import { Logger } from '../utils/logger';
import { RPCClient } from '../utils/rpc.client';
interface Order {
    orderId: string;
    runeId: string;
    amount: number;
    price: number;
    type: 'buy' | 'sell';
    status: 'open' | 'filled' | 'cancelled';
    timestamp: number;
}
interface OrderParams {
    runeId: string;
    amount: number;
    price: number;
    type: 'buy' | 'sell';
}
export declare class RunesOrderService {
    private readonly rpcClient;
    private readonly logger;
    constructor(rpcClient: RPCClient, logger: Logger);
    createOrder(params: OrderParams): Promise<Order>;
    cancelOrder(orderId: string): Promise<Order>;
    getOrderStatus(orderId: string): Promise<Order>;
}
export {};
