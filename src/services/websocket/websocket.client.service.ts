export interface WebSocketClientConfig {
    url: string;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
}

export class WebSocketClientService {
    private ws: WebSocket | null = null;
    private config: WebSocketClientConfig;
    private reconnectAttempts = 0;

    constructor(config: WebSocketClientConfig) {
        this.config = {
            reconnectInterval: 5000,
            maxReconnectAttempts: 5,
            ...config
        };
    }

    connect(): void {
        try {
            this.ws = new WebSocket(this.config.url);
            this.setupEventHandlers();
        } catch (error) {
            console.error('WebSocket connection error:', error);
            this.handleReconnect();
        }
    }

    private setupEventHandlers(): void {
        if (!this.ws) return;

        this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.reconnectAttempts = 0;
        };

        this.ws.onclose = () => {
            console.log('WebSocket closed');
            this.handleReconnect();
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    private handleReconnect(): void {
        if (this.reconnectAttempts < (this.config.maxReconnectAttempts || 5)) {
            this.reconnectAttempts++;
            setTimeout(() => this.connect(), this.config.reconnectInterval);
        }
    }

    send(data: any): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }

    close(): void {
        if (this.ws) {
            this.ws.close();
        }
    }
} 