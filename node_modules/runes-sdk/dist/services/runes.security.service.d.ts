import { RPCClient } from '../utils/rpc.client';
import { Logger } from '../utils/logger';
export declare class RunesSecurityService {
    private readonly rpcClient;
    private readonly logger;
    constructor(rpcClient: RPCClient, logger: Logger);
    verifyRune(runeId: string): Promise<boolean>;
    checkSecurity(runeId: string): Promise<{
        secure: boolean;
        issues: string[];
    }>;
}
