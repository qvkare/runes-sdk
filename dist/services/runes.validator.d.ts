import { Logger, LogLevel } from '../utils/logger';
import { RPCClient } from '../utils/rpc.client';
import { ValidationResult, Transfer } from '../types';
export declare class RunesValidator implements Logger {
    private readonly rpcClient;
    private readonly logger;
    constructor(rpcClient: RPCClient, logger: Logger);
    get level(): LogLevel;
    get context(): string;
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
    debug(message: string): void;
    shouldLog(level: LogLevel): boolean;
    validateAddress(address: string): Promise<ValidationResult>;
    validateTransfer(params: Transfer): Promise<ValidationResult>;
    validateAmount(amount: number): Promise<ValidationResult>;
    validateRuneId(runeId: string): ValidationResult;
    validateRuneExists(runeId: string): Promise<ValidationResult>;
}
