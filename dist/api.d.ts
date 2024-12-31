import { RPCClient } from './utils/rpc.client';
import { Logger } from './utils/logger';
import { RunesValidator } from './utils/runes.validator';
import { RuneInfo, RuneTransaction, RuneTransfer } from './types/rune.types';
export declare class RunesAPI {
    private readonly rpcClient;
    private readonly validator;
    private readonly logger;
    constructor(rpcClient: RPCClient, validator: RunesValidator, logger: Logger);
    createRune(params: {
        name: string;
        symbol: string;
        totalSupply: string;
        decimals: number;
        owner: string;
        metadata?: Record<string, any>;
    }): Promise<RuneInfo>;
    transferRune(params: RuneTransfer): Promise<RuneTransaction>;
    getRuneInfo(runeId: string): Promise<RuneInfo>;
    getRuneBalance(runeId: string, address: string): Promise<string>;
}
