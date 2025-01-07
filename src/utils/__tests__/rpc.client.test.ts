import { RpcClient } from '../rpc.client';
import { Logger } from '../../typescript/services/logger/logger.service';

jest.mock('../../typescript/services/logger/logger.service');

describe('RpcClient', () => {
    let rpcClient: RpcClient;
    let mockFetch: jest.Mock;
    let mockLogger: jest.Mocked<Logger>;

    beforeEach(() => {
        mockFetch = jest.fn();
        global.fetch = mockFetch;
        mockLogger = {
            error: jest.fn(),
            warn: jest.fn(),
            info: jest.fn(),
            debug: jest.fn()
        } as jest.Mocked<Logger>;
        rpcClient = new RpcClient('http://localhost:8332', mockLogger);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should create instance with default values', () => {
            expect(rpcClient).toBeDefined();
            expect(rpcClient.getHeaders()).toHaveProperty('Content-Type', 'application/json');
        });

        it('should throw error for invalid URL', () => {
            expect(() => new RpcClient('')).toThrow('Invalid RPC URL');
            expect(() => new RpcClient(undefined as any)).toThrow('Invalid RPC URL');
            expect(() => new RpcClient(null as any)).toThrow('Invalid RPC URL');
        });

        it('should initialize with logger', () => {
            const client = new RpcClient('http://localhost:8332', mockLogger);
            expect(client).toBeDefined();
        });
    });

    describe('header management', () => {
        it('should set header', () => {
            rpcClient.setHeader('Authorization', 'Bearer token');
            expect(rpcClient.getHeaders()).toHaveProperty('Authorization', 'Bearer token');
        });

        it('should throw error for invalid header name', () => {
            expect(() => rpcClient.setHeader('', 'value')).toThrow('Invalid header name');
            expect(() => rpcClient.setHeader(undefined as any, 'value')).toThrow('Invalid header name');
            expect(() => rpcClient.setHeader(null as any, 'value')).toThrow('Invalid header name');
        });

        it('should remove header', () => {
            rpcClient.setHeader('Authorization', 'Bearer token');
            rpcClient.removeHeader('Authorization');
            expect(rpcClient.getHeaders()).not.toHaveProperty('Authorization');
        });

        it('should handle removing non-existent header', () => {
            rpcClient.removeHeader('NonExistent');
            expect(rpcClient.getHeaders()).not.toHaveProperty('NonExistent');
        });

        it('should clear all headers', () => {
            rpcClient.setHeader('Authorization', 'Bearer token');
            rpcClient.setHeader('Custom-Header', 'custom-value');
            rpcClient.clearHeaders();
            expect(rpcClient.getHeaders()).toEqual({});
        });

        it('should return copy of headers', () => {
            rpcClient.setHeader('Authorization', 'Bearer token');
            const headers = rpcClient.getHeaders();
            headers.Authorization = 'Modified';
            expect(rpcClient.getHeaders().Authorization).toBe('Bearer token');
        });
    });

    describe('RPC call handling', () => {
        it('should make successful RPC call', async () => {
            const mockResponse = { result: { value: 'test' }, error: null };
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            const result = await rpcClient.call('test_method', ['param1']);
            expect(result).toEqual({ value: 'test' });
            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:8332',
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.any(Object),
                    body: expect.stringContaining('"method":"test_method"')
                })
            );
        });

        it('should handle RPC error response', async () => {
            const mockResponse = { 
                result: null, 
                error: { code: -32601, message: 'Method not found' } 
            };
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            await expect(rpcClient.call('invalid_method'))
                .rejects
                .toThrow('RPC Error: Method not found (code: -32601)');
            expect(mockLogger.error).toHaveBeenCalled();
        });

        it('should handle network error', async () => {
            const networkError = new Error('Network error');
            mockFetch.mockRejectedValueOnce(networkError);
            
            await expect(rpcClient.call('test_method'))
                .rejects
                .toThrow('Network error');
            expect(mockLogger.error).toHaveBeenCalledWith(
                'RPC call failed',
                networkError
            );
        });

        it('should handle non-OK response', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404
            });

            await expect(rpcClient.call('test_method'))
                .rejects
                .toThrow('HTTP error! status: 404');
            expect(mockLogger.error).toHaveBeenCalled();
        });

        it('should handle invalid JSON response', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.reject(new Error('Invalid JSON'))
            });

            await expect(rpcClient.call('test_method'))
                .rejects
                .toThrow('Invalid JSON');
            expect(mockLogger.error).toHaveBeenCalled();
        });
    });

    describe('RPC response validation', () => {
        it('should handle null response', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(null)
            });

            await expect(rpcClient.call('test_method'))
                .rejects
                .toThrow('Invalid RPC response');
        });

        it('should handle non-object response', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve('not an object')
            });

            await expect(rpcClient.call('test_method'))
                .rejects
                .toThrow('Invalid RPC response');
        });

        it('should handle missing result in response', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ error: null })
            });

            await expect(rpcClient.call('test_method'))
                .rejects
                .toThrow('Invalid RPC response');
        });

        it('should handle error without code', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ 
                    error: { message: 'Custom error' } 
                })
            });

            await expect(rpcClient.call('test_method'))
                .rejects
                .toThrow('RPC Error: Custom error');
        });

        it('should handle error without message', async () => {
            const customError = { code: -32000 };
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ error: customError })
            });

            await expect(rpcClient.call('test_method'))
                .rejects
                .toThrow(`RPC Error: ${customError.toString()} (code: -32000)`);
        });
    });
}); 