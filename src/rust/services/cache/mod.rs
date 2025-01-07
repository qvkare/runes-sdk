use std::sync::Arc;
use std::time::Duration;
use cached::{Cached, TimedCache, SizedCache};
use tokio::sync::RwLock;
use serde::{Serialize, de::DeserializeOwned};

use crate::types::{
    error::RuneError,
    rune::{RunesTransactionResponse, RuneTransfer},
};

#[derive(Debug, Clone)]
pub struct CacheConfig {
    pub transaction_cache_size: usize,
    pub transaction_ttl: Duration,
    pub address_cache_size: usize,
    pub address_ttl: Duration,
}

impl Default for CacheConfig {
    fn default() -> Self {
        Self {
            transaction_cache_size: 10_000,
            transaction_ttl: Duration::from_secs(300), // 5 minutes
            address_cache_size: 5_000,
            address_ttl: Duration::from_secs(60),      // 1 minute
        }
    }
}

pub struct RunesCache {
    transaction_cache: Arc<RwLock<TimedCache<String, Arc<RunesTransactionResponse>>>>,
    address_cache: Arc<RwLock<TimedCache<String, Arc<Vec<RuneTransfer>>>>>,
    metrics: Arc<CacheMetrics>,
}

pub struct CacheMetrics {
    hits: metrics::Counter,
    misses: metrics::Counter,
    evictions: metrics::Counter,
}

impl RunesCache {
    pub fn new(config: CacheConfig, metrics: Arc<CacheMetrics>) -> Self {
        Self {
            transaction_cache: Arc::new(RwLock::new(TimedCache::with_lifespan_and_capacity(
                config.transaction_ttl.as_secs() as u64,
                config.transaction_cache_size,
            ))),
            address_cache: Arc::new(RwLock::new(TimedCache::with_lifespan_and_capacity(
                config.address_ttl.as_secs() as u64,
                config.address_cache_size,
            ))),
            metrics,
        }
    }

    pub async fn get_transaction(
        &self,
        tx_id: &str,
    ) -> Option<Arc<RunesTransactionResponse>> {
        let cache = self.transaction_cache.read().await;
        let result = cache.cache_get(tx_id).cloned();
        
        match result {
            Some(_) => self.metrics.hits.increment(1),
            None => self.metrics.misses.increment(1),
        }
        
        result
    }

    pub async fn set_transaction(
        &self,
        tx_id: String,
        response: RunesTransactionResponse,
    ) -> Result<(), RuneError> {
        let mut cache = self.transaction_cache.write().await;
        if cache.cache_set(tx_id, Arc::new(response)).is_some() {
            self.metrics.evictions.increment(1);
        }
        Ok(())
    }

    pub async fn get_address_transfers(
        &self,
        address: &str,
    ) -> Option<Arc<Vec<RuneTransfer>>> {
        let cache = self.address_cache.read().await;
        let result = cache.cache_get(address).cloned();
        
        match result {
            Some(_) => self.metrics.hits.increment(1),
            None => self.metrics.misses.increment(1),
        }
        
        result
    }

    pub async fn set_address_transfers(
        &self,
        address: String,
        transfers: Vec<RuneTransfer>,
    ) -> Result<(), RuneError> {
        let mut cache = self.address_cache.write().await;
        if cache.cache_set(address, Arc::new(transfers)).is_some() {
            self.metrics.evictions.increment(1);
        }
        Ok(())
    }

    pub async fn invalidate_transaction(&self, tx_id: &str) {
        let mut cache = self.transaction_cache.write().await;
        cache.cache_remove(tx_id);
    }

    pub async fn invalidate_address(&self, address: &str) {
        let mut cache = self.address_cache.write().await;
        cache.cache_remove(address);
    }

    pub async fn clear_all(&self) {
        let mut tx_cache = self.transaction_cache.write().await;
        let mut addr_cache = self.address_cache.write().await;
        
        tx_cache.cache_clear();
        addr_cache.cache_clear();
    }

    pub async fn get_metrics(&self) -> CacheStats {
        CacheStats {
            transaction_cache_size: self.transaction_cache.read().await.cache_size(),
            address_cache_size: self.address_cache.read().await.cache_size(),
            hits: self.metrics.hits.get_count(),
            misses: self.metrics.misses.get_count(),
            evictions: self.metrics.evictions.get_count(),
        }
    }
}

#[derive(Debug, Serialize)]
pub struct CacheStats {
    pub transaction_cache_size: usize,
    pub address_cache_size: usize,
    pub hits: u64,
    pub misses: u64,
    pub evictions: u64,
} 