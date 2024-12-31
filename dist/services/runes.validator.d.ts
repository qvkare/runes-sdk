import { Logger } from '../utils/logger';
import { RunesValidationResult } from '../types/validation.types';
export declare class RunesValidator extends Logger {
    constructor();
    validateTransfer(from: string, to: string, amount: bigint): Promise<RunesValidationResult>;
    private _validateAddress;
}
