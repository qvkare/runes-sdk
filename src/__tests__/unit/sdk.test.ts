import { RunesSDK, SDKConfig } from '../../sdk';
import { WebSocketService } from '../../services/websocket/websocket.service';

jest.mock('../../services/websocket/websocket.service');

describe('RunesSDK', () => {
  let mockWebSocketService: jest.Mocked<WebSocketService>;

  beforeEach(() => {
    mockWebSocketService = {
      shutdown: jest.fn()
    } as any;

    (WebSocketService as jest.Mock).mockImplementation(() => mockWebSocketService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default config', () => {
    const config: SDKConfig = {
      host: 'localhost',
      username: 'test',
      password: 'test'
    };
    const sdk = new RunesSDK(config);
    expect(sdk).toBeDefined();
    expect(WebSocketService).not.toHaveBeenCalled();
  });

  it('should initialize with custom websocket config', () => {
    const config: SDKConfig = {
      host: 'localhost',
      username: 'test',
      password: 'test',
      websocket: {
        port: 8080,
        host: 'localhost',
        ipWhitelist: ['127.0.0.1'],
        rateLimit: 1000
      }
    };
    const sdk = new RunesSDK(config);
    expect(sdk).toBeDefined();
    expect(WebSocketService).toHaveBeenCalled();
  });

  it('should shutdown websocket service', () => {
    const config: SDKConfig = {
      host: 'localhost',
      username: 'test',
      password: 'test',
      websocket: {
        port: 8080,
        host: 'localhost'
      }
    };
    const sdk = new RunesSDK(config);
    sdk.shutdown();
    expect(mockWebSocketService.shutdown).toHaveBeenCalled();
  });

  it('should get websocket service', () => {
    const config: SDKConfig = {
      host: 'localhost',
      username: 'test',
      password: 'test'
    };
    const sdk = new RunesSDK(config);
    expect(sdk.getWebSocketService()).toBeNull();

    const configWithWs: SDKConfig = {
      ...config,
      websocket: {
        port: 8080,
        host: 'localhost'
      }
    };
    const sdkWithWs = new RunesSDK(configWithWs);
    expect(sdkWithWs.getWebSocketService()).toBe(mockWebSocketService);
  });
});
