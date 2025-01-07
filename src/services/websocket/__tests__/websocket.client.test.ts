import { WebSocketClientService } from '../websocket.client.service';

// WebSocket durumları için sabitler
const WS_STATES = {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3
};

describe('WebSocketClientService', () => {
    let service: WebSocketClientService;
    let mockWebSocket: jest.Mock;
    let mockWebSocketInstance: any;
    let mockConsoleError: jest.SpyInstance;

    beforeEach(() => {
        jest.useFakeTimers();
        
        // Console.error'u mock'la
        mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        // Her test için yeni bir mock instance oluştur
        mockWebSocketInstance = {
            send: jest.fn(),
            close: jest.fn(),
            readyState: WS_STATES.CONNECTING,
            onopen: null,
            onclose: null,
            onerror: null,
            onmessage: null,
            addEventListener: jest.fn((event, handler) => {
                mockWebSocketInstance[`on${event}`] = handler;
            }),
            removeEventListener: jest.fn()
        };

        // Mock WebSocket constructor'ı
        mockWebSocket = jest.fn(() => mockWebSocketInstance);
        (global as any).WebSocket = mockWebSocket;
        
        service = new WebSocketClientService('ws://test.com');
        
        // Bağlantıyı simüle et
        mockWebSocketInstance.readyState = WS_STATES.OPEN;
        if (mockWebSocketInstance.onopen) {
            mockWebSocketInstance.onopen(new Event('open'));
        }
    });

    afterEach(() => {
        service.disconnect();
        jest.clearAllTimers();
        jest.clearAllMocks();
        mockConsoleError.mockRestore();
    });

    it('should throw error when URL is not provided', () => {
        expect(() => new WebSocketClientService('')).toThrow('WebSocket URL is required');
    });

    it('should throw error when message is not provided', () => {
        expect(() => service.send(null)).toThrow('Message is required');
    });

    it('should send message when connected', async () => {
        const testMessage = { type: 'test' };
        service.send(testMessage);
        
        expect(mockWebSocketInstance.readyState).toBe(WS_STATES.OPEN);
        expect(mockWebSocketInstance.send).toHaveBeenCalledWith(JSON.stringify(testMessage));
    });

    it('should queue messages when not connected and send them after connection', async () => {
        // Bağlantıyı kapat
        mockWebSocketInstance.readyState = WS_STATES.CLOSED;
        if (mockWebSocketInstance.onclose) {
            mockWebSocketInstance.onclose(new Event('close'));
        }
        
        const testMessage = { type: 'test' };
        service.send(testMessage);
        
        // Mesajın hemen gönderilmemesi gerekiyor
        expect(mockWebSocketInstance.send).not.toHaveBeenCalled();
        
        // Yeni bağlantı oluştur
        mockWebSocketInstance.readyState = WS_STATES.OPEN;
        if (mockWebSocketInstance.onopen) {
            mockWebSocketInstance.onopen(new Event('open'));
        }
        
        // Jest zamanlayıcılarını ilerlet
        jest.runAllTimers();
        
        // Mesajın gönderilmiş olması gerekiyor
        expect(mockWebSocketInstance.send).toHaveBeenCalledWith(JSON.stringify(testMessage));
    });

    it('should handle reconnection with exponential backoff', () => {
        // İlk bağlantıyı kapat
        mockWebSocketInstance.readyState = WS_STATES.CLOSED;
        if (mockWebSocketInstance.onclose) {
            mockWebSocketInstance.onclose(new Event('close'));
        }
        
        // İlk yeniden bağlanma denemesi (1 saniye sonra)
        jest.advanceTimersByTime(1000);
        expect(mockWebSocket).toHaveBeenCalledTimes(2);
        
        // İkinci yeniden bağlanma denemesi (2 saniye sonra)
        mockWebSocketInstance.readyState = WS_STATES.CLOSED;
        if (mockWebSocketInstance.onclose) {
            mockWebSocketInstance.onclose(new Event('close'));
        }
        jest.advanceTimersByTime(2000);
        expect(mockWebSocket).toHaveBeenCalledTimes(3);
        
        // Üçüncü yeniden bağlanma denemesi (4 saniye sonra)
        mockWebSocketInstance.readyState = WS_STATES.CLOSED;
        if (mockWebSocketInstance.onclose) {
            mockWebSocketInstance.onclose(new Event('close'));
        }
        jest.advanceTimersByTime(4000);
        expect(mockWebSocket).toHaveBeenCalledTimes(4);
    });

    it('should handle WebSocket errors', () => {
        const error = new Error('WebSocket error');
        if (mockWebSocketInstance.onerror) {
            mockWebSocketInstance.onerror(new Event('error'));
        }
        
        expect(mockConsoleError).toHaveBeenCalledWith('WebSocket error:', expect.any(Event));
        
        // Hata sonrası yeniden bağlanma denemesi
        jest.advanceTimersByTime(1000);
        expect(mockWebSocket).toHaveBeenCalledTimes(2);
    });

    it('should handle message parsing errors', () => {
        const invalidMessage = 'invalid json';
        if (mockWebSocketInstance.onmessage) {
            mockWebSocketInstance.onmessage({ data: invalidMessage });
        }
        
        expect(mockConsoleError).toHaveBeenCalledWith(
            'Error parsing message:',
            expect.any(SyntaxError)
        );
    });

    it('should return correct WebSocket state', () => {
        expect(service.getState()).toBe(WS_STATES.OPEN);
        
        service.disconnect();
        expect(service.getState()).toBe(WS_STATES.CLOSED);
    });
}); 