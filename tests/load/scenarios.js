import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

// Test configuration
export const options = {
  scenarios: {
    // Smoke test
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '1m',
      tags: { test_type: 'smoke' },
    },
    // Load test
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 10 },
        { duration: '5m', target: 10 },
        { duration: '2m', target: 0 },
      ],
      tags: { test_type: 'load' },
    },
    // Stress test
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 20 },
        { duration: '5m', target: 20 },
        { duration: '5m', target: 30 },
        { duration: '2m', target: 0 },
      ],
      tags: { test_type: 'stress' },
    },
    // Spike test
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 50 },
        { duration: '1m', target: 0 },
      ],
      tags: { test_type: 'spike' },
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    'http_req_duration{type:mint}': ['p(95)<1000'], // Mint operations
    'http_req_duration{type:transfer}': ['p(95)<800'], // Transfer operations
    errors: ['rate<0.1'], // Error rate should be below 10%
  },
};

// Test data
const TEST_SYMBOL = 'TEST';
const TEST_ADDRESS = 'tb1qtest...'; // Replace with actual testnet address

// Helper functions
function generateRandomAmount() {
  return Math.floor(Math.random() * 1000) + 100;
}

// Test scenarios
export function mintRunes() {
  const payload = JSON.stringify({
    symbol: TEST_SYMBOL,
    supply: generateRandomAmount()
  });

  const response = http.post('http://localhost:9090/api/mint', payload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { type: 'mint' },
  });

  check(response, {
    'mint status is 200': (r) => r.status === 200,
    'mint response has txid': (r) => r.json('txid') !== undefined,
  }) || errorRate.add(1);

  sleep(1);
}

export function transferRunes() {
  const payload = JSON.stringify({
    symbol: TEST_SYMBOL,
    amount: generateRandomAmount(),
    to: TEST_ADDRESS
  });

  const response = http.post('http://localhost:9090/api/transfer', payload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { type: 'transfer' },
  });

  check(response, {
    'transfer status is 200': (r) => r.status === 200,
    'transfer response has txid': (r) => r.json('txid') !== undefined,
  }) || errorRate.add(1);

  sleep(1);
}

export function getBalance() {
  const response = http.get(`http://localhost:9090/api/balance/${TEST_ADDRESS}/${TEST_SYMBOL}`, {
    tags: { type: 'balance' },
  });

  check(response, {
    'balance status is 200': (r) => r.status === 200,
    'balance response has amount': (r) => r.json('amount') !== undefined,
  }) || errorRate.add(1);
}

// Default function
export default function() {
  const scenario = Math.random();
  
  if (scenario < 0.3) {
    mintRunes();
  } else if (scenario < 0.6) {
    transferRunes();
  } else {
    getBalance();
  }
} 