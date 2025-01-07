// Environment variables for testing
process.env.RPC_HOST = process.env.RPC_HOST || 'http://localhost:8332';
process.env.RPC_USER = process.env.RPC_USER || 'test';
process.env.RPC_PASS = process.env.RPC_PASS || 'test';

// Global test timeout
jest.setTimeout(30000);

// Mock external services if needed
if (process.env.NODE_ENV === 'test') {
  // Mock axios for webhook calls
  jest.mock('axios', () => ({
    post: jest.fn().mockResolvedValue({ status: 200 }),
  }));
}

// Clean up function
afterAll(async () => {
  // Clean up any test data or connections
});
