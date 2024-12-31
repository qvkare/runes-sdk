import { jest } from '@jest/globals';
import { Logger, LogLevel } from './logger';
import { RPCClient } from './rpc.client';
import { RunesValidator } from './runes.validator';

export interface MockObject {
  [key: string]: unknown;
}

export function createMockLogger(): Logger {
  return {
    error: jest.fn() as jest.MockedFunction<Logger['error']>,
    warn: jest.fn() as jest.MockedFunction<Logger['warn']>,
    info: jest.fn() as jest.MockedFunction<Logger['info']>,
    debug: jest.fn() as jest.MockedFunction<Logger['debug']>,
    shouldLog: jest.fn().mockReturnValue(true) as jest.MockedFunction<Logger['shouldLog']>,
    context: 'test',
    level: LogLevel.INFO
  };
}

export function createMockRpcClient(): RPCClient {
  const client = new RPCClient('test', 'test', 'test', createMockLogger());
  client.call = jest.fn().mockImplementation(async () => ({})) as jest.MockedFunction<RPCClient['call']>;
  return client;
}

interface MockResponse extends Omit<Response, 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData' | 'clone' | 'bytes'> {
  json: () => Promise<any>;
  text: () => Promise<string>;
  blob: () => Promise<Blob>;
  arrayBuffer: () => Promise<ArrayBuffer>;
  formData: () => Promise<FormData>;
  clone: () => Response;
  bytes: () => Promise<Uint8Array>;
}

export function createMockResponse(): Response {
  const mockResponse: Partial<MockResponse> = {
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers(),
    body: null,
    bodyUsed: false,
    type: 'default',
    url: '',
    redirected: false,
  };

  mockResponse.json = jest.fn().mockImplementation(async () => ({})) as () => Promise<any>;
  mockResponse.text = jest.fn().mockImplementation(async () => '') as () => Promise<string>;
  mockResponse.blob = jest.fn().mockImplementation(async () => new Blob()) as () => Promise<Blob>;
  mockResponse.arrayBuffer = jest.fn().mockImplementation(async () => new ArrayBuffer(0)) as () => Promise<ArrayBuffer>;
  mockResponse.formData = jest.fn().mockImplementation(async () => new FormData()) as () => Promise<FormData>;
  mockResponse.clone = jest.fn().mockImplementation(() => mockResponse as Response) as () => Response;
  mockResponse.bytes = jest.fn().mockImplementation(async () => new Uint8Array()) as () => Promise<Uint8Array>;

  return mockResponse as Response;
}

interface MockRequest extends Omit<Request, 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData' | 'clone' | 'bytes'> {
  json: () => Promise<any>;
  text: () => Promise<string>;
  blob: () => Promise<Blob>;
  arrayBuffer: () => Promise<ArrayBuffer>;
  formData: () => Promise<FormData>;
  clone: () => Request;
  bytes: () => Promise<Uint8Array>;
}

export function createMockRequest(): Request {
  const mockRequest: Partial<MockRequest> = {
    method: 'GET',
    url: 'test',
    headers: new Headers(),
    body: null,
    bodyUsed: false,
    cache: 'default',
    credentials: 'same-origin',
    destination: 'document',
    integrity: '',
    keepalive: false,
    mode: 'cors',
    redirect: 'follow',
    referrer: '',
    referrerPolicy: 'no-referrer',
    signal: new AbortController().signal,
  };

  mockRequest.json = jest.fn().mockImplementation(async () => ({})) as () => Promise<any>;
  mockRequest.text = jest.fn().mockImplementation(async () => '') as () => Promise<string>;
  mockRequest.blob = jest.fn().mockImplementation(async () => new Blob()) as () => Promise<Blob>;
  mockRequest.arrayBuffer = jest.fn().mockImplementation(async () => new ArrayBuffer(0)) as () => Promise<ArrayBuffer>;
  mockRequest.formData = jest.fn().mockImplementation(async () => new FormData()) as () => Promise<FormData>;
  mockRequest.clone = jest.fn().mockImplementation(() => mockRequest as Request) as () => Request;
  mockRequest.bytes = jest.fn().mockImplementation(async () => new Uint8Array()) as () => Promise<Uint8Array>;

  return mockRequest as Request;
}

export function mockFetch(_url: string, _options?: RequestInit): Promise<Response> {
  return Promise.resolve(createMockResponse());
}

export function createMockValidator(): RunesValidator {
  const validator = new RunesValidator(createMockRpcClient(), createMockLogger());
  validator.validateTransfer = jest.fn().mockReturnValue({
    isValid: true,
    errors: [],
    operations: []
  }) as jest.MockedFunction<RunesValidator['validateTransfer']>;
  return validator;
} 