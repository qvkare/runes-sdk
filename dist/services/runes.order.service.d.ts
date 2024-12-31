import { Logger } from '../utils/logger';
import { RPCClient } from '../utils/rpc.client';
import { OrderParams, OrderResult } from '../types';
export declare class RunesOrderService {
    private readonly rpcClient;
    private readonly logger;
    constructor(rpcClient: RPCClient, logger: Logger);
    createOrder(params: OrderParams): Promise<OrderResult>;
    cancelOrder(orderId: string): Promise<boolean>;
}
