import { createMockLogger, createMockRpcClient, createMockResponse, createMockRequest, mockFetch, createMockValidator } from '../test.utils';
import { LogLevel } from '../logger';

describe('test.utils', () => {
  describe('createMockLogger', () => {
    it('should create a mock logger with all required methods', () => {
      const logger = createMockLogger();

      expect(logger.error).toBeDefined();
      expect(logger.warn).toBeDefined();
      expect(logger.info).toBeDefined();
      expect(logger.debug).toBeDefined();
      expect(logger.shouldLog).toBeDefined();
      expect(logger.context).toBe('test');
      expect(logger.level).toBe(LogLevel.INFO);
    });

    it('should call logger methods correctly', () => {
      const logger = createMockLogger();
      
      logger.error('test error');
      expect(logger.error).toHaveBeenCalledWith('test error');
      
      logger.warn('test warning');
      expect(logger.warn).toHaveBeenCalledWith('test warning');
      
      logger.info('test info');
      expect(logger.info).toHaveBeenCalledWith('test info');
      
      logger.debug('test debug');
      expect(logger.debug).toHaveBeenCalledWith('test debug');
      
      logger.shouldLog(LogLevel.DEBUG);
      expect(logger.shouldLog).toHaveBeenCalledWith(LogLevel.DEBUG);
    });
  });

  describe('createMockRpcClient', () => {
    it('should create a mock RPC client with call method', () => {
      const client = createMockRpcClient();
      expect(client.call).toBeDefined();
    });

    it('should handle RPC calls correctly', async () => {
      const client = createMockRpcClient();
      const result = await client.call('test', ['param1', 'param2']);
      expect(result).toEqual({});
      expect(client.call).toHaveBeenCalledWith('test', ['param1', 'param2']);
    });
  });

  describe('createMockResponse', () => {
    it('should create a mock Response with all required methods', () => {
      const response = createMockResponse();

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(response.statusText).toBe('OK');
      expect(response.headers).toBeDefined();
      expect(response.body).toBeNull();
      expect(response.bodyUsed).toBe(false);
      expect(response.type).toBe('default');
      expect(response.url).toBe('');
      expect(response.redirected).toBe(false);

      expect(response.json).toBeDefined();
      expect(response.text).toBeDefined();
      expect(response.blob).toBeDefined();
      expect(response.arrayBuffer).toBeDefined();
      expect(response.formData).toBeDefined();
      expect(response.clone).toBeDefined();
    });

    it('should handle response methods correctly', async () => {
      const response = createMockResponse();
      
      const jsonResult = await response.json();
      expect(jsonResult).toEqual({});
      
      const textResult = await response.text();
      expect(textResult).toBe('');
      
      const blobResult = await response.blob();
      expect(blobResult).toBeInstanceOf(Blob);
      
      const arrayBufferResult = await response.arrayBuffer();
      expect(arrayBufferResult).toBeInstanceOf(ArrayBuffer);
      
      const formDataResult = await response.formData();
      expect(formDataResult).toBeInstanceOf(FormData);
      
      const cloneResult = response.clone();
      expect(cloneResult).toBeDefined();
      
      const bytesResult = await response.bytes();
      expect(bytesResult).toBeInstanceOf(Uint8Array);
    });
  });

  describe('createMockRequest', () => {
    it('should create a mock Request with all required methods', () => {
      const request = createMockRequest();

      expect(request.method).toBe('GET');
      expect(request.url).toBe('test');
      expect(request.headers).toBeDefined();
      expect(request.body).toBeNull();
      expect(request.bodyUsed).toBe(false);
      expect(request.cache).toBe('default');
      expect(request.credentials).toBe('same-origin');
      expect(request.destination).toBe('document');
      expect(request.integrity).toBe('');
      expect(request.keepalive).toBe(false);
      expect(request.mode).toBe('cors');
      expect(request.redirect).toBe('follow');
      expect(request.referrer).toBe('');
      expect(request.referrerPolicy).toBe('no-referrer');
      expect(request.signal).toBeDefined();

      expect(request.json).toBeDefined();
      expect(request.text).toBeDefined();
      expect(request.blob).toBeDefined();
      expect(request.arrayBuffer).toBeDefined();
      expect(request.formData).toBeDefined();
      expect(request.clone).toBeDefined();
    });

    it('should handle request methods correctly', async () => {
      const request = createMockRequest();
      
      const jsonResult = await request.json();
      expect(jsonResult).toEqual({});
      
      const textResult = await request.text();
      expect(textResult).toBe('');
      
      const blobResult = await request.blob();
      expect(blobResult).toBeInstanceOf(Blob);
      
      const arrayBufferResult = await request.arrayBuffer();
      expect(arrayBufferResult).toBeInstanceOf(ArrayBuffer);
      
      const formDataResult = await request.formData();
      expect(formDataResult).toBeInstanceOf(FormData);
      
      const cloneResult = request.clone();
      expect(cloneResult).toBeDefined();
      
      const bytesResult = await request.bytes();
      expect(bytesResult).toBeInstanceOf(Uint8Array);
    });
  });

  describe('mockFetch', () => {
    it('should return a mock Response', async () => {
      const response = await mockFetch('test');
      expect(response).toBeDefined();
      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
    });

    it('should handle fetch with options', async () => {
      const options = {
        method: 'POST',
        body: JSON.stringify({ test: 'data' })
      };
      const response = await mockFetch('test', options);
      expect(response).toBeDefined();
      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
    });
  });

  describe('createMockValidator', () => {
    it('should create a mock validator with validateTransfer method', () => {
      const validator = createMockValidator();
      expect(validator.validateTransfer).toBeDefined();
    });

    it('should handle validation correctly', () => {
      const validator = createMockValidator();
      const result = validator.validateTransfer({
        from: 'addr1',
        to: 'addr2',
        amount: '100',
        symbol: 'RUNE'
      });
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.operations).toEqual([]);
      expect(validator.validateTransfer).toHaveBeenCalled();
    });
  });
}); 