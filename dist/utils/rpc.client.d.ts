import { Logger } from './logger';
export interface RPCResponse<T = unknown> {
    jsonrpc: string;
    id: number;
    result?: T;
    error?: {
        code: number;
        message: string;
    };
}
export declare class RPCClient {
    private readonly url;
    private readonly username;
    private readonly password;
    private readonly logger?;
    private id;
    constructor(url: string, username: string, password: string, logger?: Logger | undefined);
    call<T = any>(method: string, params?: any[]): Promise<T>;
}
