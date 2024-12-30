import { jest } from '@jest/globals';
import RunesAPI from '../index';
import { Logger } from '../utils/logger';

describe('RunesAPI', () => {
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
    } as jest.Mocked<Logger>;
  });

  it('should initialize API with default configuration', () => {
    const api = new RunesAPI({
      host: 'localhost',
      port: 8332,
      username: 'user',
      password: 'pass',
    });

    expect(api).toBeDefined();
    expect(api.runes).toBeDefined();
    expect(api.security).toBeDefined();
  });

  it('should initialize API with custom logger', () => {
    const customApi = new RunesAPI({
      host: 'localhost',
      port: 8332,
      username: 'user',
      password: 'pass',
      logger: mockLogger,
    });

    expect(customApi).toBeDefined();
    expect(customApi.runes).toBeDefined();
    expect(customApi.security).toBeDefined();
  });

  it('should initialize API with minimal configuration', () => {
    const minimalApi = new RunesAPI({
      host: 'localhost',
      port: 8332,
      username: 'user',
      password: 'pass',
    });

    expect(minimalApi).toBeDefined();
    expect(minimalApi.runes).toBeDefined();
    expect(minimalApi.security).toBeDefined();
  });

  it('should expose runes API methods', () => {
    const api = new RunesAPI({
      host: 'localhost',
      port: 8332,
      username: 'user',
      password: 'pass',
    });

    expect(api.runes).toBeDefined();
    expect(typeof api.runes.createRune).toBe('function');
    expect(typeof api.runes.transferRune).toBe('function');
    expect(typeof api.runes.getRuneHistory).toBe('function');
    expect(typeof api.runes.getRuneBalance).toBe('function');
  });

  it('should expose security API methods', () => {
    const api = new RunesAPI({
      host: 'localhost',
      port: 8332,
      username: 'user',
      password: 'pass',
    });

    expect(api.security).toBeDefined();
    expect(typeof api.security.validateRuneCreation).toBe('function');
    expect(typeof api.security.validateRuneTransfer).toBe('function');
  });
});
