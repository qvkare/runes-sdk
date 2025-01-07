export class WebSocketClientService {
    private ws: WebSocket | null = null;
    private messageQueue: any[] = [];
    private isConnecting = false;
    private reconnectAttempts = 0;
    private readonly maxReconnectAttempts = 5;
    private readonly reconnectInterval = 1000;
    private readonly url: string;
    private isDisconnecting = false;
    private reconnectTimeout: NodeJS.Timeout | null = null;

    // WebSocket durumları için sabitler
    private readonly WS_STATES = {
        CONNECTING: 0,
        OPEN: 1,
        CLOSING: 2,
        CLOSED: 3
    };

    constructor(url: string) {
        if (!url) {
            throw new Error('WebSocket URL is required');
        }
        this.url = url;
        this.connect();
    }

    private connect(): void {
        if (this.isConnecting || this.isDisconnecting || !this.url) return;
        
        this.isConnecting = true;
        
        try {
            this.ws = new WebSocket(this.url);
        } catch (error) {
            this.isConnecting = false;
            throw new Error('WebSocket initialization failed');
        }

        this.ws.addEventListener('open', () => {
            this.isConnecting = false;
            this.reconnectAttempts = 0;
            this.processMessageQueue();
        });

        this.ws.addEventListener('close', () => {
            this.isConnecting = false;
            if (!this.isDisconnecting && this.reconnectAttempts < this.maxReconnectAttempts) {
                const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts);
                this.reconnectTimeout = setTimeout(() => {
                    this.reconnectAttempts++;
                    this.connect();
                }, delay);
            }
        });

        this.ws.addEventListener('error', (error: Event) => {
            console.error('WebSocket error:', error);
            this.isConnecting = false;
            if (!this.isDisconnecting) {
                this.handleError(error);
            }
        });

        this.ws.addEventListener('message', (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        });
    }

    private handleError(error: Event): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        
        if (!this.isDisconnecting && this.reconnectAttempts < this.maxReconnectAttempts) {
            const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts);
            this.reconnectAttempts++;
            this.reconnectTimeout = setTimeout(() => {
                this.connect();
            }, delay);
        }
    }

    private handleMessage(data: any): void {
        // Mesaj işleme mantığı buraya eklenebilir
    }

    public send(message: any): void {
        if (!message) {
            throw new Error('Message is required');
        }

        if (!this.ws || this.ws.readyState !== this.WS_STATES.OPEN || this.isConnecting) {
            this.messageQueue.push(message);
            if (!this.isConnecting && !this.isDisconnecting) {
                this.connect();
            }
            return;
        }

        try {
            const messageStr = JSON.stringify(message);
            this.ws.send(messageStr);
        } catch (error) {
            console.error('Error sending message:', error);
            this.messageQueue.push(message);
            if (!this.isConnecting && !this.isDisconnecting) {
                this.connect();
            }
        }
    }

    private processMessageQueue(): void {
        if (!this.ws || this.ws.readyState !== this.WS_STATES.OPEN || this.isConnecting) {
            if (!this.isConnecting && !this.isDisconnecting) {
                this.connect();
            }
            return;
        }

        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            if (message) {
                try {
                    const messageStr = JSON.stringify(message);
                    this.ws.send(messageStr);
                } catch (error) {
                    console.error('Error processing message from queue:', error);
                    this.messageQueue.unshift(message);
                    break;
                }
            }
        }
    }

    public disconnect(): void {
        this.isDisconnecting = true;
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.messageQueue = [];
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.isDisconnecting = false;
    }

    public getState(): number {
        return this.ws ? this.ws.readyState : this.WS_STATES.CLOSED;
    }
} 