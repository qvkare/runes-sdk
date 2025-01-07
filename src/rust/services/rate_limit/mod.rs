use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;
use dashmap::DashMap;
use serde::{Deserialize, Serialize};

use crate::types::error::RuneError;

#[derive(Debug, Clone, Deserialize)]
pub struct RateLimitConfig {
    pub window_size: Duration,
    pub max_requests: u32,
    pub burst_size: u32,
}

impl Default for RateLimitConfig {
    fn default() -> Self {
        Self {
            window_size: Duration::from_secs(60),  // 1 dakika
            max_requests: 100,                     // Dakikada 100 istek
            burst_size: 10,                        // Anlık 10 istek burst
        }
    }
}

#[derive(Debug)]
struct TokenBucket {
    tokens: f64,
    last_update: Instant,
    max_tokens: f64,
    tokens_per_sec: f64,
}

impl TokenBucket {
    fn new(max_tokens: u32, window_size: Duration) -> Self {
        Self {
            tokens: max_tokens as f64,
            last_update: Instant::now(),
            max_tokens: max_tokens as f64,
            tokens_per_sec: max_tokens as f64 / window_size.as_secs_f64(),
        }
    }

    fn try_acquire(&mut self, tokens: f64) -> bool {
        let now = Instant::now();
        let elapsed = now.duration_since(self.last_update).as_secs_f64();
        
        // Token'ları yenile
        self.tokens = (self.tokens + elapsed * self.tokens_per_sec).min(self.max_tokens);
        self.last_update = now;

        // İstenilen token sayısı mevcut mu kontrol et
        if self.tokens >= tokens {
            self.tokens -= tokens;
            true
        } else {
            false
        }
    }
}

pub struct RateLimiter {
    config: RateLimitConfig,
    buckets: DashMap<String, Arc<RwLock<TokenBucket>>>,
    metrics: Arc<RateLimitMetrics>,
}

pub struct RateLimitMetrics {
    allowed_requests: metrics::Counter,
    rejected_requests: metrics::Counter,
    current_buckets: metrics::Gauge,
}

#[derive(Debug, Serialize)]
pub struct RateLimitStats {
    pub allowed_requests: u64,
    pub rejected_requests: u64,
    pub current_buckets: i64,
}

impl RateLimiter {
    pub fn new(config: RateLimitConfig, metrics: Arc<RateLimitMetrics>) -> Self {
        Self {
            config,
            buckets: DashMap::new(),
            metrics,
        }
    }

    pub async fn check_rate_limit(&self, key: &str, cost: u32) -> Result<(), RuneError> {
        let bucket = self.buckets
            .entry(key.to_string())
            .or_insert_with(|| {
                self.metrics.current_buckets.increment(1);
                Arc::new(RwLock::new(TokenBucket::new(
                    self.config.max_requests,
                    self.config.window_size,
                )))
            })
            .value()
            .clone();

        let mut bucket = bucket.write().await;
        if bucket.try_acquire(cost as f64) {
            self.metrics.allowed_requests.increment(1);
            Ok(())
        } else {
            self.metrics.rejected_requests.increment(1);
            Err(RuneError::RateLimitExceeded)
        }
    }

    pub fn cleanup_old_buckets(&self, max_age: Duration) {
        let now = Instant::now();
        self.buckets.retain(|_, bucket| {
            let last_update = bucket.try_read()
                .map(|b| b.last_update)
                .unwrap_or_else(|| now);
            
            let should_retain = now.duration_since(last_update) < max_age;
            if !should_retain {
                self.metrics.current_buckets.decrement(1);
            }
            should_retain
        });
    }

    pub async fn get_metrics(&self) -> RateLimitStats {
        RateLimitStats {
            allowed_requests: self.metrics.allowed_requests.get_count(),
            rejected_requests: self.metrics.rejected_requests.get_count(),
            current_buckets: self.metrics.current_buckets.get_value(),
        }
    }
} 