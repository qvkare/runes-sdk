import { WebSocketService, WebSocketConfig } from './services/websocket/websocket.service';
import { Logger } from './services/logger/logger.service';
import { RunesAPI } from './runes.api';
import { RpcClient } from './utils/rpc.client';

export class RunesSDK {
    private logger: Logger;
    private webSocketService?: WebSocketService;
    private runesAPI: RunesAPI;

    constructor(
        private readonly config: {
            rpcUrl: string;
            wsUrl?: string;
        }
    ) {
        this.logger = new Logger('RunesSDK');
        const rpcClient = new RpcClient(config.rpcUrl);
        this.runesAPI = new RunesAPI(rpcClient);

        if (config.wsUrl) {
            const wsConfig: WebSocketConfig = {
                url: config.wsUrl
            };
            this.webSocketService = new WebSocketService(wsConfig);
        }
    }

    connect(): void {
        this.webSocketService?.connect();
    }

    disconnect(): void {
        this.webSocketService?.close();
    }

    async getTransaction(txid: string) {
        try {
            return await this.runesAPI.getTransaction(txid);
        } catch (error) {
            this.logger.error('Failed to get transaction', error as Error);
            throw error;
        }
    }
}
