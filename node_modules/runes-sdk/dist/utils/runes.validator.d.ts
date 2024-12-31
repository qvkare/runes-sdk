import { RPCClient } from './rpc.client';
import { Logger } from './logger';
import { ValidationResult } from '../types';
export interface Transfer {
    runeId: string;
    amount: string;
    fromAddress: string;
    toAddress: string;
}
export declare class RunesValidator {
    private readonly rpcClient;
    private readonly logger;
    constructor(rpcClient: RPCClient, logger: Logger);
    validateTransfer(transfer: Transfer): Promise<ValidationResult>;
    validateAddress(address: string): Promise<ValidationResult>;
    validateRuneId(runeId: string): Promise<ValidationResult>;
    isValidAmount(amount: string): boolean;
}
