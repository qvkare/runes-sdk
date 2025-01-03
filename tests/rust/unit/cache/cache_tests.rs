use std::sync::Arc;
use std::time::Duration;

use crate::services::cache::{RunesCache, CacheConfig, CacheMetrics};
use crate::types::rune::{RunesTransactionResponse, RuneTransfer, TransactionStatus, NetworkType};

#[tokio::test]
async fn test_transaction_cache() {
    let metrics = Arc::new(CacheMetrics {
        hits: metrics::Counter::new("test_cache_hits"),
        misses: metrics::Counter::new("test_cache_misses"),
        evictions: metrics::Counter::new("test_cache_evictions"),
    });

    let config = CacheConfig {
        transaction_cache_size: 2,
        transaction_ttl: Duration::from_secs(1),
        address_cache_size: 2,
        address_ttl: Duration::from_secs(1),
    };

    let cache = RunesCache::new(config, metrics);

    // Test transaction caching
    let tx1 = RunesTransactionResponse {
        transaction_id: "tx1".to_string(),
        status: TransactionStatus::Confirmed,
        network: NetworkType::Mainnet,
        runes: vec![],
        confirmations: Some(6),
    };

    let tx2 = RunesTransactionResponse {
        transaction_id: "tx2".to_string(),
        status: TransactionStatus::Confirmed,
        network: NetworkType::Mainnet,
        runes: vec![],
        confirmations: Some(3),
    };

    // Cache miss for non-existent transaction
    assert!(cache.get_transaction("tx1").await.is_none());

    // Cache set and get
    cache.set_transaction("tx1".to_string(), tx1.clone()).await.unwrap();
    let cached_tx = cache.get_transaction("tx1").await.unwrap();
    assert_eq!(cached_tx.transaction_id, "tx1");

    // Test cache eviction
    cache.set_transaction("tx2".to_string(), tx2.clone()).await.unwrap();
    tokio::time::sleep(Duration::from_secs(2)).await;
    assert!(cache.get_transaction("tx1").await.is_none());
    assert!(cache.get_transaction("tx2").await.is_none());
}

#[tokio::test]
async fn test_address_cache() {
    let metrics = Arc::new(CacheMetrics {
        hits: metrics::Counter::new("test_cache_hits"),
        misses: metrics::Counter::new("test_cache_misses"),
        evictions: metrics::Counter::new("test_cache_evictions"),
    });

    let config = CacheConfig {
        transaction_cache_size: 2,
        transaction_ttl: Duration::from_secs(1),
        address_cache_size: 2,
        address_ttl: Duration::from_secs(1),
    };

    let cache = RunesCache::new(config, metrics);

    // Test address transfers caching
    let transfers1 = vec![RuneTransfer {
        rune_id: "rune1".to_string(),
        amount: 100,
        from_address: Some("addr1".to_string()),
        to_address: "addr2".to_string(),
    }];

    let transfers2 = vec![RuneTransfer {
        rune_id: "rune2".to_string(),
        amount: 200,
        from_address: Some("addr2".to_string()),
        to_address: "addr3".to_string(),
    }];

    // Cache miss for non-existent address
    assert!(cache.get_address_transfers("addr1").await.is_none());

    // Cache set and get
    cache.set_address_transfers("addr1".to_string(), transfers1.clone()).await.unwrap();
    let cached_transfers = cache.get_address_transfers("addr1").await.unwrap();
    assert_eq!(cached_transfers.len(), 1);
    assert_eq!(cached_transfers[0].rune_id, "rune1");

    // Test cache eviction
    cache.set_address_transfers("addr2".to_string(), transfers2.clone()).await.unwrap();
    tokio::time::sleep(Duration::from_secs(2)).await;
    assert!(cache.get_address_transfers("addr1").await.is_none());
    assert!(cache.get_address_transfers("addr2").await.is_none());
}

#[tokio::test]
async fn test_cache_invalidation() {
    let metrics = Arc::new(CacheMetrics {
        hits: metrics::Counter::new("test_cache_hits"),
        misses: metrics::Counter::new("test_cache_misses"),
        evictions: metrics::Counter::new("test_cache_evictions"),
    });

    let config = CacheConfig::default();
    let cache = RunesCache::new(config, metrics);

    // Set up test data
    let tx = RunesTransactionResponse {
        transaction_id: "tx1".to_string(),
        status: TransactionStatus::Confirmed,
        network: NetworkType::Mainnet,
        runes: vec![],
        confirmations: Some(6),
    };

    let transfers = vec![RuneTransfer {
        rune_id: "rune1".to_string(),
        amount: 100,
        from_address: Some("addr1".to_string()),
        to_address: "addr2".to_string(),
    }];

    // Cache items
    cache.set_transaction("tx1".to_string(), tx.clone()).await.unwrap();
    cache.set_address_transfers("addr1".to_string(), transfers.clone()).await.unwrap();

    // Test individual invalidation
    cache.invalidate_transaction("tx1").await;
    assert!(cache.get_transaction("tx1").await.is_none());
    assert!(cache.get_address_transfers("addr1").await.is_some());

    cache.invalidate_address("addr1").await;
    assert!(cache.get_address_transfers("addr1").await.is_none());

    // Test clear all
    cache.set_transaction("tx1".to_string(), tx.clone()).await.unwrap();
    cache.set_address_transfers("addr1".to_string(), transfers.clone()).await.unwrap();
    
    cache.clear_all().await;
    assert!(cache.get_transaction("tx1").await.is_none());
    assert!(cache.get_address_transfers("addr1").await.is_none());
}

#[tokio::test]
async fn test_cache_metrics() {
    let metrics = Arc::new(CacheMetrics {
        hits: metrics::Counter::new("test_cache_hits"),
        misses: metrics::Counter::new("test_cache_misses"),
        evictions: metrics::Counter::new("test_cache_evictions"),
    });

    let config = CacheConfig {
        transaction_cache_size: 1,
        transaction_ttl: Duration::from_secs(60),
        address_cache_size: 1,
        address_ttl: Duration::from_secs(60),
    };

    let cache = RunesCache::new(config, metrics);

    let tx = RunesTransactionResponse {
        transaction_id: "tx1".to_string(),
        status: TransactionStatus::Confirmed,
        network: NetworkType::Mainnet,
        runes: vec![],
        confirmations: Some(6),
    };

    // Test cache miss
    cache.get_transaction("tx1").await;
    let stats = cache.get_metrics().await;
    assert_eq!(stats.misses, 1);
    assert_eq!(stats.hits, 0);
    assert_eq!(stats.evictions, 0);

    // Test cache hit
    cache.set_transaction("tx1".to_string(), tx.clone()).await.unwrap();
    cache.get_transaction("tx1").await;
    let stats = cache.get_metrics().await;
    assert_eq!(stats.hits, 1);

    // Test eviction
    let tx2 = RunesTransactionResponse {
        transaction_id: "tx2".to_string(),
        status: TransactionStatus::Confirmed,
        network: NetworkType::Mainnet,
        runes: vec![],
        confirmations: Some(3),
    };
    cache.set_transaction("tx2".to_string(), tx2.clone()).await.unwrap();
    let stats = cache.get_metrics().await;
    assert_eq!(stats.evictions, 1);
} 