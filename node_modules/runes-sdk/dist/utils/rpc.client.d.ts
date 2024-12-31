import { Logger } from './logger';
import { RPCResponse } from '../types';
interface RPCClientConfig {
    logger: Logger;
    timeout?: number;
    maxRetries?: number;
    retryDelay?: number;
}
export declare class RPCClient {
    readonly baseUrl: string;
    private readonly timeout;
    private readonly maxRetries;
    private readonly retryDelay;
    private readonly logger;
    constructor(baseUrl: string, config: RPCClientConfig);
    call<T>(method: string, params?: unknown[]): Promise<RPCResponse<T>>;
    private makeRequest;
    private delay;
}
export {};
