import { RunesSDK, SDKConfig } from '../sdk';
import { WebSocketService } from '../services/websocket/websocket.service';

jest.mock('../services/websocket/websocket.service');

describe('RunesSDK', () => {
  let sdk: RunesSDK;
  const mockConfig: SDKConfig = {
    host: 'test-host',
    username: 'test-user',
    password: 'test-pass',
    websocket: {
      port: 8080,
      host: 'localhost',
      maxConnections: 100,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize without WebSocket when config is not provided', () => {
    const configWithoutWs: SDKConfig = {
      host: 'test-host',
      username: 'test-user',
      password: 'test-pass',
    };

    sdk = new RunesSDK(configWithoutWs);
    expect(sdk.getWebSocketService()).toBeNull();
  });

  it('should initialize WebSocket service when config is provided', () => {
    sdk = new RunesSDK(mockConfig);
    expect(WebSocketService).toHaveBeenCalledWith(mockConfig.websocket, expect.any(Object));
    expect(sdk.getWebSocketService()).not.toBeNull();
  });

  it('should shutdown WebSocket service properly', () => {
    sdk = new RunesSDK(mockConfig);
    const wsService = sdk.getWebSocketService();

    sdk.shutdown();

    expect(wsService?.shutdown).toHaveBeenCalled();
  });
});
