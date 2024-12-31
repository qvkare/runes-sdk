import { RPCClient } from '../utils/rpc.client';
import { Logger } from '../utils/logger';
interface SecurityVerification {
    txId: string;
    isValid: boolean;
    signatures: string[];
    timestamp: number;
    reason?: string;
}
interface SecurityCheck {
    runeId: string;
    isSecure: boolean;
    vulnerabilities: string[];
    lastAudit: number;
}
export declare class RunesSecurityService {
    private readonly rpcClient;
    private readonly logger;
    constructor(rpcClient: RPCClient, logger: Logger);
    verifyTransaction(txId: string): Promise<SecurityVerification>;
    checkRuneSecurity(runeId: string): Promise<SecurityCheck>;
}
export {};
