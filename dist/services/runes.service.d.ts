import { RPCClient } from '../utils/rpc.client';
import { Logger } from '../utils/logger';
import { RunesValidator } from '../utils/runes.validator';
import { RuneTransfer } from '../types/rune.types';
export declare class RunesService {
    private readonly rpcClient;
    private readonly logger;
    private readonly validator;
    constructor(rpcClient: RPCClient, logger: Logger, validator: RunesValidator);
    transferRune(transfer: RuneTransfer): Promise<any>;
}
