import { WebSocketClientService } from '../services/websocket/websocket.client.service';
import { WebSocketServerService } from '../services/websocket/websocket.server.service';
import { Logger } from './services/logger/logger.service';
import { RunesAPI } from './runes.api';
import { RpcClient } from '../utils/rpc.client';

export interface RunesSDKConfig {
    rpcUrl: string;
    wsUrl?: string;
    reconnectAttempts?: number;
    reconnectInterval?: number;
}

export class RunesSDK {
    private logger: Logger;
    private webSocketService?: WebSocketClientService;
    private runesAPI: RunesAPI;
    private isInitialized = false;

    constructor(private readonly config: RunesSDKConfig) {
        if (!config.rpcUrl) {
            throw new Error('RPC URL is required');
        }

        this.logger = new Logger('RunesSDK');
        const rpcClient = new RpcClient(config.rpcUrl);
        this.runesAPI = new RunesAPI(rpcClient);

        if (config.wsUrl) {
            try {
                this.webSocketService = new WebSocketClientService(config.wsUrl);
                this.isInitialized = true;
            } catch (error) {
                this.logger.error('Failed to initialize WebSocket service', error as Error);
                throw new Error('WebSocket initialization failed');
            }
        }
    }

    public isConnected(): boolean {
        return this.webSocketService?.getState() === 1; // OPEN state
    }

    connect(): void {
        if (!this.webSocketService && this.config.wsUrl) {
            try {
                this.webSocketService = new WebSocketClientService(this.config.wsUrl);
                this.isInitialized = true;
            } catch (error) {
                this.logger.error('Failed to initialize WebSocket service', error as Error);
                throw new Error('WebSocket initialization failed');
            }
        }
    }

    disconnect(): void {
        if (this.webSocketService) {
            this.webSocketService.disconnect();
            this.isInitialized = false;
        }
    }

    async getTransaction(txid: string) {
        if (!txid) {
            throw new Error('Transaction ID is required');
        }

        try {
            return await this.runesAPI.getTransaction(txid);
        } catch (error) {
            this.logger.error('Failed to get transaction', error as Error);
            throw error;
        }
    }

    public getWebSocketState(): number | undefined {
        return this.webSocketService?.getState();
    }
}
