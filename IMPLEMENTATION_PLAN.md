# Ord Development Plan: New Features for CEX Integrations

## Project Structure and Migration Strategy

### Current Structure (TypeScript)
```
src/
├── api/
├── services/
├── types/
├── __tests__/
├── config/
├── utils/
├── sdk.ts
├── index.ts
└── runes.api.ts
```

### Target Structure
```
src/
├── typescript/           # Existing TS code (preserved structure)
│   ├── api/
│   ├── services/
│   ├── types/
│   ├── __tests__/
│   ├── config/
│   ├── utils/
│   ├── sdk.ts
│   ├── index.ts
│   └── runes.api.ts
├── rust/                # New Rust modules
│   ├── api/
│   │   ├── runes/
│   │   │   ├── handlers.rs
│   │   │   ├── models.rs
│   │   │   └── routes.rs
│   │   ├── node/
│   │   │   ├── connection.rs
│   │   │   └── sync.rs
│   │   └── cex/
│   │       ├── webhook.rs
│   │       └── batch.rs
│   ├── services/
│   │   ├── cache/
│   │   └── metrics/
│   └── types/
│       ├── rune.rs
│       └── error.rs
└── shared/              # Shared types and utilities
    ├── constants/
    │   ├── endpoints.ts
    │   └── config.ts
    └── interfaces/
        ├── transaction.ts
        └── rune.ts
```

### Migration Steps
1. Create new directories without modifying existing code
2. Implement new features in Rust modules
3. Create shared interfaces
4. Update imports gradually

## 1. Transaction ID based Runes Query API

### Shared Types (TypeScript & Rust Interface)
```typescript
// src/shared/interfaces/transaction.ts
export interface SharedTransaction {
    txid: string;
    blockHeight?: number;
    confirmations: number;
    timestamp: number;
}

export interface SharedRuneTransfer {
    runeId: string;
    fromAddress: string;
    toAddress: string;
    amount: string;
    type: 'mint' | 'transfer' | 'burn';
}
```

### Rust Implementation
```rust
// src/rust/types/rune.rs
#[derive(Debug, Serialize, Deserialize)]
pub struct RunesTransactionResponse {
    transaction_id: String,
    runes: Vec<RuneTransfer>,
    block_height: Option<u32>,
    confirmation_count: u32,
    timestamp: u64,
    network_type: NetworkType,
    status: TransactionStatus,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RuneTransfer {
    rune_id: String,
    from_address: String,
    to_address: String,
    amount: u64,
    transfer_type: TransferType,
    fee: Option<u64>,
    metadata: Option<HashMap<String, Value>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum TransferType {
    Mint,
    Transfer,
    Burn,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum TransactionStatus {
    Pending,
    Confirmed,
    Failed,
}

// src/rust/types/error.rs
#[derive(Debug, Error)]
pub enum RuneError {
    #[error("Invalid transaction: {0}")]
    InvalidTransaction(String),
    #[error("Network error: {0}")]
    NetworkError(#[from] reqwest::Error),
    #[error("Rate limit exceeded")]
    RateLimitExceeded,
    #[error("Database error: {0}")]
    DatabaseError(#[from] sqlx::Error),
    #[error("Node connection error: {0}")]
    NodeConnectionError(String),
}
```

### API Routes Configuration
```rust
// src/rust/api/runes/routes.rs
pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/v1/runes")
            .service(get_transaction)
            .service(get_batch_transactions)
    );
}
```

## 2. Ord Node Integration

### Node Connection Management
```rust
// src/rust/services/node/connection.rs
pub struct NodeConnection {
    config: NodeConfig,
    client: Arc<HttpClient>,
    metrics: Arc<MetricsCollector>,
}

impl NodeConnection {
    pub async fn connect(&self) -> Result<(), NodeError> {
        // Implementation with retry logic
    }

    pub async fn health_check(&self) -> Result<NodeStatus, NodeError> {
        // Implementation
    }
}

// src/rust/services/node/metrics.rs
pub struct MetricsCollector {
    transaction_counter: Counter,
    error_counter: Counter,
    response_time: Histogram,
    active_connections: Gauge,
}
```

### Synchronization Service
```rust
// src/rust/services/node/sync.rs
pub struct SyncService {
    node: Arc<NodeConnection>,
    db: Arc<Database>,
    cache: Arc<RunesCache>,
}

impl SyncService {
    pub async fn start_sync(&self) -> Result<(), SyncError> {
        // Implementation with progress tracking
    }

    pub async fn get_sync_status(&self) -> SyncStatus {
        // Implementation
    }
}
```

## 3. CEX Integrations

### Webhook System
```rust
// src/rust/api/cex/webhook.rs
pub struct WebhookManager {
    config: WebhookConfig,
    client: reqwest::Client,
    retry_policy: RetryPolicy,
}

impl WebhookManager {
    pub async fn send_notification(
        &self,
        event: WebhookEvent,
    ) -> Result<(), WebhookError> {
        // Implementation with retry logic
    }
}
```

### Caching
```rust
// src/rust/services/cache/mod.rs
pub struct RunesCache {
    transaction_cache: Cache<String, Arc<RunesTransactionResponse>>,
    address_cache: Cache<String, Arc<Vec<RuneBalance>>>,
    config: CacheConfig,
}

impl RunesCache {
    pub async fn get_transaction(
        &self,
        tx_id: &str,
    ) -> Option<Arc<RunesTransactionResponse>> {
        // Implementation with metrics
    }
}
```

## Dependencies

```toml
[dependencies]
tokio = { version = "1.0", features = ["full"] }
async-trait = "0.1.68"
serde = { version = "1.0", features = ["derive"] }
reqwest = { version = "0.11", features = ["json"] }
sqlx = { version = "0.7", features = ["postgres", "runtime-tokio-native-tls"] }
tracing = "0.1"
metrics = "0.21"
cached = "0.44"
thiserror = "1.0"
mockall = "0.11"

[dev-dependencies]
tokio-test = "0.4"
wiremock = "0.5"
```

## Test Organization

### TypeScript Tests (Existing)
```
src/typescript/__tests__/
├── unit/
│   └── runes.test.ts
└── integration/
    └── api.test.ts
```

### Rust Tests (New)
```
tests/rust/
├── unit/
│   ├── runes/
│   │   └── transaction_tests.rs
│   └── node/
│       └── connection_tests.rs
└── integration/
    ├── api/
    │   └── runes_api_tests.rs
    └── cex/
        └── webhook_tests.rs
```

## Development Phases

### Phase 1: Core Infrastructure (3-4 weeks)
- Create new directory structure
- Implement shared interfaces
- Set up Rust environment
- Basic API implementation

### Phase 2: Core Features (4-5 weeks)
- Node connection management
- Synchronization service
- Caching system
- Metrics collection
- Test implementation

### Phase 3: CEX Integrations (5-6 weeks)
- Webhook system
- Batch transaction support
- Rate limiting
- API security
- Performance optimizations
- Documentation

## Build and Test Configuration

### Package Configuration
```json
{
  "name": "runes-sdk",
  "version": "0.1.12",
  "scripts": {
    "build": "npm run build:ts && npm run build:rust",
    "build:ts": "tsc",
    "build:rust": "cargo build --release",
    "test": "npm run test:ts && npm run test:rust",
    "test:ts": "jest",
    "test:rust": "cargo test",
    "lint": "npm run lint:ts && npm run lint:rust",
    "lint:ts": "tsc --noEmit",
    "lint:rust": "cargo clippy -- -D warnings",
    "clean": "rimraf dist",
    "prebuild": "npm run clean"
  }
}
```

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src/typescript",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "paths": {
      "@shared/*": ["./src/shared/*"]
    }
  },
  "include": [
    "src/typescript/**/*",
    "src/shared/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "src/rust"
  ]
}
```

### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: [
    '<rootDir>/src/typescript',
    '<rootDir>/tests/typescript'
  ],
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/src/shared/$1'
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/src/rust/'
  ]
};
```

### Rust Test Configuration
```toml
# Cargo.toml test configuration
[dev-dependencies]
tokio-test = "0.4"
wiremock = "0.5"
mockall = "0.11"
test-case = "2.2"

[[test]]
name = "integration"
path = "tests/rust/integration/main.rs"
harness = true

[[test]]
name = "unit"
path = "tests/rust/unit/main.rs"
harness = true
```

## CI/CD Pipeline

### Main Workflow
```yaml
# .github/workflows/main.yml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  typescript:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Lint TypeScript
        run: npm run lint:ts
        
      - name: Test TypeScript
        run: npm run test:ts
        
      - name: Build TypeScript
        run: npm run build:ts

  rust:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v2
      
      - name: Install Rust
        uses: actions-rs/toolchain@v1
        with:
          profile: minimal
          toolchain: stable
          components: clippy
          
      - name: Cache dependencies
        uses: actions/cache@v2
        with:
          path: |
            ~/.cargo/registry
            ~/.cargo/git
            target
          key: ${{ runner.os }}-cargo-${{ hashFiles('**/Cargo.lock') }}
          
      - name: Lint Rust
        run: cargo clippy -- -D warnings
        
      - name: Test Rust
        run: |
          cargo test --all-features
          cargo test --all -- --ignored
          
      - name: Build Rust
        run: cargo build --release

  publish:
    needs: [typescript, rust]
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          registry-url: 'https://registry.npmjs.org'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Publish to NPM
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Release Workflow
```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  create-release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          draft: false
          prerelease: false

  build-artifacts:
    needs: create-release
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Package artifacts
        run: |
          tar -czf runes-sdk-${{ github.ref }}.tar.gz dist/
          
      - name: Upload artifacts
        uses: actions/upload-release-asset@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          upload_url: ${{ steps.create_release.outputs.upload_url }}
          asset_path: ./runes-sdk-${{ github.ref }}.tar.gz
          asset_name: runes-sdk-${{ github.ref }}.tar.gz
          asset_content_type: application/gzip
```

## Monitoring and Logging

```rust
// src/rust/observability/metrics.rs
pub struct MetricsCollector {
    transaction_counter: Counter,
    error_counter: Counter,
    response_time: Histogram,
    active_connections: Gauge,
}

// src/rust/observability/logging.rs
pub fn setup_logging(config: LogConfig) {
    tracing_subscriber::fmt()
        .with_env_filter(config.log_level)
        .with_target(true)
        .with_thread_ids(true)
        .with_file(true)
        .with_line_number(true)
        .init();
}
```

## Mevcut Durum ve Yapılacaklar

### Tamamlanan Aşamalar ✅

1. Proje Yapısı ve Migrasyon
   - Dizin yapısı oluşturuldu
   - Rust modülleri implementasyonu yapıldı
   - Shared interfaces tamamlandı

2. Transaction ID based Runes Query API
   - Shared types oluşturuldu
   - Rust implementasyonu yapıldı
   - API routes konfigürasyonu tamamlandı

3. Ord Node Integration
   - Node bağlantı yönetimi implementasyonu yapıldı
   - Senkronizasyon servisi oluşturuldu
   - Mock node desteği eklendi

4. CEX Integrations
   - Webhook sistemi implementasyonu yapıldı
   - Caching sistemi kuruldu
   - Redis entegrasyonu tamamlandı

5. Monitoring ve Metrics
   - Prometheus entegrasyonu yapıldı
   - Grafana dashboardları oluşturuldu
   - Health check endpoints eklendi

6. Docker ve Deployment
   - Dockerfile oluşturuldu
   - Docker Compose yapılandırması tamamlandı
   - Helm chart'ları hazırlandı

### Yapılacak Aşama: CI/CD Pipeline ⏳

1. GitHub Actions Workflow Gereksinimleri
   - [ ] Pull request workflow'u
   - [ ] Main branch workflow'u
   - [ ] Release workflow'u

2. Test Otomasyonu
   - [ ] Unit test pipeline'ı
   - [ ] Integration test pipeline'ı
   - [ ] E2E test pipeline'ı

3. Build ve Deployment Otomasyonu
   - [ ] Docker image build pipeline'ı
   - [ ] Staging ortamına otomatik deployment
   - [ ] Production ortamına manuel onaylı deployment

4. Release Yönetimi
   - [ ] Semantic versioning
   - [ ] Changelog otomasyonu
   - [ ] Release notes oluşturma

5. Güvenlik ve Kalite
   - [ ] Dependency scanning
   - [ ] SAST (Static Application Security Testing)
   - [ ] Code quality checks
   - [ ] Coverage raporları

Not: CI/CD pipeline'ı daha sonra implemente edilecektir. Şu an için manuel deployment ve test süreçleri kullanılabilir. 