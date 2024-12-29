import { APIService } from '../services/api';
import { SDKConfig } from '../types/config';

describe('APIService', () => {
  let apiService: APIService;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    mockFetch = jest.fn(() => 
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: {} })
      })
    );

    global.fetch = mockFetch;

    const config: SDKConfig = {
      ordServer: 'http://localhost:8332',
      timeout: 5000,
      retryAttempts: 3
    };

    apiService = new APIService(config);
  });

  describe('getRune', () => {
    it('should fetch rune info successfully', async () => {
      const mockRune = {
        id: 'rune1',
        name: 'Test Rune',
        symbol: 'TEST'
      };

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockRune)
        })
      );

      const result = await apiService.getRune('rune1');
      expect(result).toEqual(mockRune);
    });

    it('should handle fetch errors', async () => {
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 404
        })
      );

      await expect(apiService.getRune('invalid')).rejects.toThrow('HTTP error! status: 404');
    });
  });

  describe('getRuneBalance', () => {
    it('should fetch rune balance successfully', async () => {
      const mockBalance = {
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        rune: 'rune1',
        balance: '100'
      };

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockBalance)
        })
      );

      const result = await apiService.getRuneBalance('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', 'rune1');
      expect(result).toEqual(mockBalance);
    });

    it('should handle fetch errors', async () => {
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 404
        })
      );

      await expect(apiService.getRuneBalance('invalid', 'rune1')).rejects.toThrow('HTTP error! status: 404');
    });
  });

  describe('getRuneHistory', () => {
    it('should fetch rune history successfully', async () => {
      const mockHistory = [
        {
          txid: 'tx1',
          timestamp: Date.now(),
          type: 'transfer'
        }
      ];

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockHistory)
        })
      );

      const result = await apiService.getRuneHistory('rune1');
      expect(result).toEqual(mockHistory);
    });
  });

  describe('listRunes', () => {
    it('should list runes successfully', async () => {
      const mockResponse = {
        items: [
          {
            id: 'rune1',
            name: 'Test Rune',
            symbol: 'TEST'
          }
        ],
        total: 1,
        page: 1,
        pageSize: 10
      };

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockResponse)
        })
      );

      const result = await apiService.listRunes({ page: 1, pageSize: 10 });
      expect(result).toEqual(mockResponse);
    });

    it('should handle pagination options', async () => {
      await apiService.listRunes({ page: 2, pageSize: 20 });
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8332/api/v1/runes',
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ page: 2, pageSize: 20 })
        })
      );
    });
  });

  describe('getRuneStats', () => {
    it('should fetch rune stats successfully', async () => {
      const mockStats = {
        totalSupply: '1000000',
        holders: 100,
        transactions: 500
      };

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockStats)
        })
      );

      const result = await apiService.getRuneStats('rune1');
      expect(result).toEqual(mockStats);
    });
  });

  describe('validateRuneTransaction', () => {
    it('should validate transaction successfully', async () => {
      const mockValidation = {
        isValid: true,
        errors: [],
        warnings: []
      };

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockValidation)
        })
      );

      const result = await apiService.validateRuneTransaction('txHex123');
      expect(result).toEqual(mockValidation);
    });

    it('should handle invalid transaction', async () => {
      const mockValidation = {
        isValid: false,
        errors: ['Invalid transaction format'],
        warnings: []
      };

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockValidation)
        })
      );

      const result = await apiService.validateRuneTransaction('invalid');
      expect(result).toEqual(mockValidation);
    });
  });

  describe('searchRunes', () => {
    it('should search runes successfully', async () => {
      const mockSearchResult = {
        items: [
          {
            id: 'rune1',
            name: 'Test Rune',
            symbol: 'TEST',
            score: 0.95
          }
        ],
        total: 1
      };

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockSearchResult)
        })
      );

      const result = await apiService.searchRunes({ query: 'test', limit: 10 });
      expect(result).toEqual(mockSearchResult);
    });

    it('should handle search options', async () => {
      await apiService.searchRunes({ query: 'test', limit: 20, type: 'symbol' });
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8332/api/v1/runes/search',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: 'test', limit: 20, type: 'symbol' })
        })
      );
    });
  });

  describe('error handling', () => {
    it('should handle timeout', async () => {
      const abortError = new Error('The operation was aborted');
      mockFetch.mockImplementationOnce(() => new Promise(() => {
        throw abortError;
      }));

      await expect(apiService.getRune('rune1')).rejects.toThrow(abortError);
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      mockFetch.mockImplementationOnce(() => Promise.reject(networkError));

      await expect(apiService.getRune('rune1')).rejects.toThrow(networkError);
    });

    it('should handle malformed JSON response', async () => {
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.reject(new Error('Invalid JSON'))
        })
      );

      await expect(apiService.getRune('rune1')).rejects.toThrow('Invalid JSON');
    });
  });

  describe('constructor', () => {
    it('should use default values when not provided', () => {
      const config: SDKConfig = {
        ordServer: 'http://localhost:8332'
      };

      const service = new APIService(config);
      expect(service['timeout']).toBe(30000);
      expect(service['retryAttempts']).toBe(3);
    });

    it('should use provided values', () => {
      const config: SDKConfig = {
        ordServer: 'http://localhost:8332',
        timeout: 5000,
        retryAttempts: 5
      };

      const service = new APIService(config);
      expect(service['timeout']).toBe(5000);
      expect(service['retryAttempts']).toBe(5);
    });
  });

  describe('fetch', () => {
    it('should handle request without options', async () => {
      const mockResponse = { data: 'test' };
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockResponse)
        })
      );

      const result = await apiService['fetch']('/test');
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8332/api/v1/test',
        expect.objectContaining({
          signal: expect.any(AbortSignal)
        })
      );
    });

    it('should handle request with options', async () => {
      const mockResponse = { data: 'test' };
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockResponse)
        })
      );

      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true })
      };

      const result = await apiService['fetch']('/test', options);
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8332/api/v1/test',
        expect.objectContaining({
          ...options,
          signal: expect.any(AbortSignal)
        })
      );
    });

    it('should handle timeout', async () => {
      const abortError = new Error('The operation was aborted');
      mockFetch.mockImplementationOnce(() => new Promise(() => {
        throw abortError;
      }));

      await expect(apiService['fetch']('/test')).rejects.toThrow(abortError);
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      mockFetch.mockImplementationOnce(() => Promise.reject(networkError));

      await expect(apiService['fetch']('/test')).rejects.toThrow(networkError);
    });

    it('should handle malformed JSON response', async () => {
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.reject(new Error('Invalid JSON'))
        })
      );

      await expect(apiService['fetch']('/test')).rejects.toThrow('Invalid JSON');
    });
  });

  describe('listRunes', () => {
    it('should list runes without options', async () => {
      const mockResponse = {
        items: [
          {
            id: 'rune1',
            name: 'Test Rune',
            symbol: 'TEST'
          }
        ],
        total: 1,
        page: 1,
        pageSize: 10
      };

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockResponse)
        })
      );

      const result = await apiService.listRunes();
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8332/api/v1/runes',
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          body: undefined
        })
      );
    });

    it('should list runes with options', async () => {
      const mockResponse = {
        items: [
          {
            id: 'rune1',
            name: 'Test Rune',
            symbol: 'TEST'
          }
        ],
        total: 1,
        page: 2,
        pageSize: 20
      };

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockResponse)
        })
      );

      const result = await apiService.listRunes({ page: 2, pageSize: 20 });
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8332/api/v1/runes',
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ page: 2, pageSize: 20 })
        })
      );
    });
  });

  describe('searchRunes', () => {
    it('should search runes with minimal options', async () => {
      const mockResponse = {
        items: [
          {
            id: 'rune1',
            name: 'Test Rune',
            symbol: 'TEST',
            score: 0.95
          }
        ],
        total: 1
      };

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockResponse)
        })
      );

      const result = await apiService.searchRunes({ query: 'test' });
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8332/api/v1/runes/search',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: 'test' })
        })
      );
    });

    it('should search runes with all options', async () => {
      const mockResponse = {
        items: [
          {
            id: 'rune1',
            name: 'Test Rune',
            symbol: 'TEST',
            score: 0.95
          }
        ],
        total: 1
      };

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockResponse)
        })
      );

      const searchOptions = {
        query: 'test',
        limit: 20,
        type: 'symbol',
        minScore: 0.8
      };

      const result = await apiService.searchRunes(searchOptions);
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8332/api/v1/runes/search',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(searchOptions)
        })
      );
    });
  });
}); 