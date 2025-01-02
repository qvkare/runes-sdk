/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '**/tests/performance/**/*.test.ts'
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
  testTimeout: 30000,
  maxWorkers: 1, // Run tests sequentially for accurate performance measurements
  verbose: true,
  collectCoverage: false,
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  }
}; 