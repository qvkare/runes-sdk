use std::sync::Arc;
use std::time::Duration;
use tokio::time::sleep;

use crate::services::rate_limit::{RateLimiter, RateLimitConfig, RateLimitMetrics};

#[tokio::test]
async fn test_basic_rate_limiting() {
    let metrics = Arc::new(RateLimitMetrics {
        allowed_requests: metrics::Counter::new("test_allowed_requests"),
        rejected_requests: metrics::Counter::new("test_rejected_requests"),
        current_buckets: metrics::Gauge::new("test_current_buckets"),
    });

    let config = RateLimitConfig {
        window_size: Duration::from_secs(1),
        max_requests: 5,
        burst_size: 2,
    };

    let limiter = RateLimiter::new(config, metrics);
    let key = "test_client";

    // İlk 5 istek başarılı olmalı
    for _ in 0..5 {
        assert!(limiter.check_rate_limit(key, 1).await.is_ok());
    }

    // 6. istek reddedilmeli
    assert!(limiter.check_rate_limit(key, 1).await.is_err());

    // 1 saniye bekle ve tekrar dene
    sleep(Duration::from_secs(1)).await;
    assert!(limiter.check_rate_limit(key, 1).await.is_ok());
}

#[tokio::test]
async fn test_burst_handling() {
    let metrics = Arc::new(RateLimitMetrics {
        allowed_requests: metrics::Counter::new("test_allowed_requests"),
        rejected_requests: metrics::Counter::new("test_rejected_requests"),
        current_buckets: metrics::Gauge::new("test_current_buckets"),
    });

    let config = RateLimitConfig {
        window_size: Duration::from_secs(1),
        max_requests: 10,
        burst_size: 3,
    };

    let limiter = RateLimiter::new(config, metrics);
    let key = "test_burst";

    // Burst size kadar yüksek maliyetli istek
    for _ in 0..3 {
        assert!(limiter.check_rate_limit(key, 3).await.is_ok());
    }

    // Burst limit aşıldı
    assert!(limiter.check_rate_limit(key, 3).await.is_err());

    // Normal istekler hala çalışmalı
    assert!(limiter.check_rate_limit(key, 1).await.is_ok());
}

#[tokio::test]
async fn test_multiple_clients() {
    let metrics = Arc::new(RateLimitMetrics {
        allowed_requests: metrics::Counter::new("test_allowed_requests"),
        rejected_requests: metrics::Counter::new("test_rejected_requests"),
        current_buckets: metrics::Gauge::new("test_current_buckets"),
    });

    let config = RateLimitConfig {
        window_size: Duration::from_secs(1),
        max_requests: 5,
        burst_size: 2,
    };

    let limiter = RateLimiter::new(config, metrics);
    let client1 = "client1";
    let client2 = "client2";

    // Her iki client için 5'er istek
    for _ in 0..5 {
        assert!(limiter.check_rate_limit(client1, 1).await.is_ok());
        assert!(limiter.check_rate_limit(client2, 1).await.is_ok());
    }

    // Her iki client de limit aşımı yaşamalı
    assert!(limiter.check_rate_limit(client1, 1).await.is_err());
    assert!(limiter.check_rate_limit(client2, 1).await.is_err());

    // 1 saniye bekle ve tekrar dene
    sleep(Duration::from_secs(1)).await;
    assert!(limiter.check_rate_limit(client1, 1).await.is_ok());
    assert!(limiter.check_rate_limit(client2, 1).await.is_ok());
}

#[tokio::test]
async fn test_cleanup() {
    let metrics = Arc::new(RateLimitMetrics {
        allowed_requests: metrics::Counter::new("test_allowed_requests"),
        rejected_requests: metrics::Counter::new("test_rejected_requests"),
        current_buckets: metrics::Gauge::new("test_current_buckets"),
    });

    let config = RateLimitConfig {
        window_size: Duration::from_secs(1),
        max_requests: 5,
        burst_size: 2,
    };

    let limiter = RateLimiter::new(config, metrics.clone());
    
    // Birkaç client için istek yap
    for i in 0..3 {
        let key = format!("client_{}", i);
        assert!(limiter.check_rate_limit(&key, 1).await.is_ok());
    }

    // Bucket sayısını kontrol et
    assert_eq!(metrics.current_buckets.get_value(), 3);

    // Cleanup çağır
    limiter.cleanup_old_buckets(Duration::from_millis(100));
    sleep(Duration::from_millis(200)).await;
    limiter.cleanup_old_buckets(Duration::from_millis(100));

    // Bucket sayısı azalmış olmalı
    assert_eq!(metrics.current_buckets.get_value(), 0);
}

#[tokio::test]
async fn test_metrics() {
    let metrics = Arc::new(RateLimitMetrics {
        allowed_requests: metrics::Counter::new("test_allowed_requests"),
        rejected_requests: metrics::Counter::new("test_rejected_requests"),
        current_buckets: metrics::Gauge::new("test_current_buckets"),
    });

    let config = RateLimitConfig {
        window_size: Duration::from_secs(1),
        max_requests: 2,
        burst_size: 1,
    };

    let limiter = RateLimiter::new(config, metrics);
    let key = "test_metrics";

    // İki başarılı istek
    assert!(limiter.check_rate_limit(key, 1).await.is_ok());
    assert!(limiter.check_rate_limit(key, 1).await.is_ok());

    // Bir başarısız istek
    assert!(limiter.check_rate_limit(key, 1).await.is_err());

    // Metrikleri kontrol et
    let stats = limiter.get_metrics().await;
    assert_eq!(stats.allowed_requests, 2);
    assert_eq!(stats.rejected_requests, 1);
    assert_eq!(stats.current_buckets, 1);
} 