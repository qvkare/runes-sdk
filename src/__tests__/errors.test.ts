import { RunesError, RPCError } from '../errors';

describe('Errors', () => {
  describe('RunesError', () => {
    it('should create error with message and code', () => {
      const error = new RunesError('Test error', 'VALIDATION_ERROR');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.name).toBe('RunesError');
    });
  });

  describe('RPCError', () => {
    it('should create error with message and status code', () => {
      const error = new RPCError('RPC error', -32601);
      expect(error.message).toBe('RPC error');
      expect(error.statusCode).toBe(-32601);
      expect(error.name).toBe('RPCError');
    });

    it('should be instance of RunesError', () => {
      const error = new RPCError('RPC error', -32601);
      expect(error).toBeInstanceOf(RunesError);
      expect(error.code).toBe('RPC_ERROR');
    });
  });
});
