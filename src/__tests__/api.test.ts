import { APIService } from '../services';
import { SDKConfig } from '../types';

describe('APIService', () => {
  let api: APIService;
  const mockConfig: Required<SDKConfig> = {
    ordServer: 'https://api.example.com',
    network: 'testnet',
    timeout: 5000,
    retryAttempts: 3
  };

  beforeEach(() => {
    api = new APIService(mockConfig);
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with provided config values', () => {
      const api = new APIService(mockConfig);
      expect(api['baseUrl']).toBe('https://api.example.com/api/v1');
      expect(api['timeout']).toBe(5000);
      expect(api['retryAttempts']).toBe(3);
    });

    it('should use default timeout when not provided', () => {
      const api = new APIService({
        ordServer: 'https://api.example.com',
        network: 'testnet'
      });
      expect(api['timeout']).toBe(30000);
    });

    it('should use default retryAttempts when not provided', () => {
      const api = new APIService({
        ordServer: 'https://api.example.com',
        network: 'testnet'
      });
      expect(api['retryAttempts']).toBe(3);
    });

    it('should use provided values over defaults', () => {
      const api = new APIService({
        ordServer: 'https://api.example.com',
        network: 'testnet',
        timeout: 10000,
        retryAttempts: 5
      });
      expect(api['timeout']).toBe(10000);
      expect(api['retryAttempts']).toBe(5);
    });
  });

  describe('fetch', () => {
    it('should handle successful requests', async () => {
      const mockResponse = { data: 'test' };
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await api.getRune('TEST');
      expect(result).toEqual(mockResponse);
    });

    it('should handle HTTP errors', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(api.getRune('TEST')).rejects.toThrow('HTTP error! status: 500');
    });

    it('should handle network errors', async () => {
      global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'));

      await expect(api.getRune('TEST')).rejects.toThrow('Network error');
    });

    it('should handle JSON parsing errors', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error('Invalid JSON'); }
      });

      await expect(api.getRune('TEST')).rejects.toThrow('Invalid JSON');
    });

    it('should handle timeouts', async () => {
      const mockSignal = { aborted: false };
      const mockAbort = jest.fn(() => {
        mockSignal.aborted = true;
      });
      const mockController = {
        abort: mockAbort,
        signal: mockSignal
      };

      global.AbortController = jest.fn(() => mockController) as unknown as typeof AbortController;
      
      // Mock fetch to simulate a timeout
      global.fetch = jest.fn().mockImplementationOnce(() => {
        mockAbort();
        return Promise.reject(new Error('AbortError'));
      });

      await expect(api.getRune('TEST')).rejects.toThrow('AbortError');
      expect(mockAbort).toHaveBeenCalled();
      expect(mockSignal.aborted).toBe(true);
    });

    it('should clean up timeout on success', async () => {
      const mockResponse = { data: 'test' };
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      jest.spyOn(global, 'clearTimeout');

      await api.getRune('TEST');
      expect(clearTimeout).toHaveBeenCalled();
    });

    it('should clean up timeout on error', async () => {
      global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'));

      jest.spyOn(global, 'clearTimeout');

      await expect(api.getRune('TEST')).rejects.toThrow('Network error');
      expect(clearTimeout).toHaveBeenCalled();
    });
  });

  describe('getRune', () => {
    it('should fetch rune information correctly', async () => {
      const mockResponse = {
        id: 'TEST',
        symbol: 'TST',
        supply: '1000',
        timestamp: Date.now(),
        mintable: true
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await api.getRune('TEST');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/runes/TEST',
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors correctly', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(api.getRune('TEST')).rejects.toThrow('HTTP error! status: 404');
    });

    it('should handle network errors', async () => {
      global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'));

      await expect(api.getRune('TEST')).rejects.toThrow('Network error');
    });
  });

  describe('getRuneBalance', () => {
    it('should fetch rune balance correctly', async () => {
      const mockResponse = {
        rune: 'TEST',
        amount: '100',
        address: 'bc1qxxx',
        lastUpdated: Date.now()
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await api.getRuneBalance('bc1qxxx', 'TEST');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/address/bc1qxxx/runes/TEST',
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle invalid JSON response', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error('Invalid JSON'); }
      });

      await expect(api.getRuneBalance('bc1qxxx', 'TEST')).rejects.toThrow('Invalid JSON');
    });
  });

  describe('getRuneHistory', () => {
    it('should fetch rune history correctly', async () => {
      const mockResponse = [{
        txid: 'tx1',
        timestamp: Date.now(),
        transfers: [],
        blockHeight: 100
      }];

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await api.getRuneHistory('TEST');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/runes/TEST/history',
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('listRunes', () => {
    it('should list runes with pagination options', async () => {
      const mockResponse = {
        items: [{
          id: 'TEST',
          symbol: 'TST',
          supply: '1000',
          timestamp: Date.now(),
          mintable: true
        }],
        total: 1,
        offset: 10,
        limit: 20
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const options = { offset: 10, limit: 20 };
      const result = await api.listRunes(options);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/runes',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(options)
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should list runes without pagination options', async () => {
      const mockResponse = {
        items: [{
          id: 'TEST',
          symbol: 'TST',
          supply: '1000',
          timestamp: Date.now(),
          mintable: true
        }],
        total: 1,
        offset: 0,
        limit: 10
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await api.listRunes();

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/runes',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          body: undefined
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty options object', async () => {
      const mockResponse = {
        items: [],
        total: 0,
        offset: 0,
        limit: 10
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await api.listRunes({});

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/runes',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          body: '{}'
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getRuneStats', () => {
    it('should fetch rune stats correctly', async () => {
      const mockResponse = {
        totalSupply: '1000',
        holders: 10,
        transfers: 5,
        lastActivity: Date.now()
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await api.getRuneStats('TEST');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/runes/TEST/stats',
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle non-existent rune', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(api.getRuneStats('NONEXISTENT')).rejects.toThrow('HTTP error! status: 404');
    });

    it('should handle server errors', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(api.getRuneStats('TEST')).rejects.toThrow('HTTP error! status: 500');
    });

    it('should handle network errors', async () => {
      global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'));

      await expect(api.getRuneStats('TEST')).rejects.toThrow('Network error');
    });
  });

  describe('validateRuneTransaction', () => {
    it('should validate transaction correctly', async () => {
      const mockResponse = {
        valid: true,
        transfers: []
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await api.validateRuneTransaction('txHex');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/runes/validate',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ txHex: 'txHex' })
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle validation errors', async () => {
      const mockResponse = {
        valid: false,
        transfers: [],
        errors: ['Invalid transaction format']
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await api.validateRuneTransaction('invalid-tx');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid transaction format');
    });
  });

  describe('searchRunes', () => {
    it('should search runes correctly', async () => {
      const mockResponse = {
        items: [{
          id: 'TEST',
          symbol: 'TST',
          supply: '1000',
          timestamp: Date.now(),
          mintable: true
        }],
        total: 1
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await api.searchRunes({ query: 'test' });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/runes/search',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query: 'test' })
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty search results', async () => {
      const mockResponse = {
        data: [],
        total: 0
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await api.searchRunes({ query: 'nonexistent' });
      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });
}); 