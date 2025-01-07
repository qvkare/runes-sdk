import { WebSocketClientService, WebSocketClientConfig } from '../websocket.client.service';

describe('WebSocketClientService', () => {
    let service: WebSocketClientService;
    let mockWebSocket: any;

    beforeEach(() => {
        mockWebSocket = {
            onopen: jest.fn(),
            onclose: jest.fn(),
            onerror: jest.fn(),
            send: jest.fn(),
            close: jest.fn(),
            readyState: WebSocket.OPEN
        };

        (global as any).WebSocket = jest.fn(() => mockWebSocket);

        const config: WebSocketClientConfig = {
            url: 'ws://localhost:8080'
        };
        service = new WebSocketClientService(config);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    it('should connect successfully', () => {
        service.connect();
        expect(global.WebSocket).toHaveBeenCalledWith('ws://localhost:8080');
    });

    it('should handle connection error', () => {
        const error = new Error('Connection failed');
        (global as any).WebSocket = jest.fn(() => { throw error; });
        
        const consoleSpy = jest.spyOn(console, 'error');
        service.connect();
        
        expect(consoleSpy).toHaveBeenCalledWith('WebSocket connection error:', error);
    });

    it('should send message when connected', () => {
        service.connect();
        service.send({ type: 'test' });
        
        expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify({ type: 'test' }));
    });

    it('should handle reconnection on close', () => {
        jest.useFakeTimers();
        service.connect();
        
        // İlk bağlantı
        expect(global.WebSocket).toHaveBeenCalledTimes(1);
        
        // Bağlantı kapandığında
        mockWebSocket.onclose();
        
        // Zamanlayıcıyı ilerlet
        jest.advanceTimersByTime(5000);
        
        // Yeniden bağlanma denemesi
        expect(global.WebSocket).toHaveBeenCalledTimes(2);
    });

    it('should close connection', () => {
        service.connect();
        service.close();
        
        expect(mockWebSocket.close).toHaveBeenCalled();
    });
}); 