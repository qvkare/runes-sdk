import { Logger } from './logger';
import { RPCClient } from './rpc.client';
import { ValidationResult, RuneTransfer } from '../types/rune.types';
export declare class RunesValidator {
    private readonly rpcClient;
    private readonly logger;
    constructor(rpcClient: RPCClient, logger: Logger);
    validateTransfer(params: RuneTransfer): ValidationResult;
}
