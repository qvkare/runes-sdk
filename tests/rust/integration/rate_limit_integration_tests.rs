use std::sync::Arc;
use std::time::Duration;
use actix_web::{test, web, App};

use crate::{
    api::{
        runes::{
            handlers::{RunesApiContext, BatchTransactionRequest},
            routes::configure_routes,
        },
        middleware::rate_limit::RateLimitMiddleware,
    },
    services::{
        node::connection::{NodeConnection, NodeConfig},
        cache::{RunesCache, CacheConfig, CacheMetrics},
        rate_limit::{RateLimiter, RateLimitConfig, RateLimitMetrics},
    },
};

async fn create_test_app() -> impl actix_web::dev::Service<actix_http::Request, Response = actix_web::dev::ServiceResponse, Error = actix_web::Error> {
    let node_config = NodeConfig {
        rpc_url: "http://localhost:8332".to_string(),
        username: None,
        password: None,
        timeout: Duration::from_secs(30),
        max_retries: 3,
    };

    let node = Arc::new(NodeConnection::new(
        node_config,
        Arc::new(metrics::Counter::new("test_node_errors")),
    ));

    let cache_metrics = Arc::new(CacheMetrics {
        hits: metrics::Counter::new("test_cache_hits"),
        misses: metrics::Counter::new("test_cache_misses"),
        evictions: metrics::Counter::new("test_cache_evictions"),
    });

    let cache_config = CacheConfig {
        transaction_cache_size: 1000,
        transaction_ttl: Duration::from_secs(300),
        address_cache_size: 1000,
        address_ttl: Duration::from_secs(300),
    };

    let cache = Arc::new(RunesCache::new(cache_config, cache_metrics));

    let rate_limit_metrics = Arc::new(RateLimitMetrics {
        allowed_requests: metrics::Counter::new("test_allowed_requests"),
        rejected_requests: metrics::Counter::new("test_rejected_requests"),
        current_buckets: metrics::Gauge::new("test_current_buckets"),
    });

    let rate_limit_config = RateLimitConfig {
        window_size: Duration::from_secs(1),
        max_requests: 5,
        burst_size: 2,
    };

    let rate_limiter = Arc::new(RateLimiter::new(rate_limit_config, rate_limit_metrics));

    let context = RunesApiContext {
        node,
        cache,
    };

    test::init_service(
        App::new()
            .wrap(RateLimitMiddleware::new(rate_limiter))
            .app_data(web::Data::new(context))
            .configure(configure_routes)
    ).await
}

#[actix_web::test]
async fn test_rate_limit_single_endpoint() {
    let app = create_test_app().await;
    let tx_id = "a".repeat(64);

    // First 5 requests for IP1
    for _ in 0..5 {
        let req = test::TestRequest::get()
            .uri(&format!("/api/v1/runes/transaction/{}", tx_id))
            .insert_header(("X-Real-IP", "192.168.1.1"))
            .to_request();

        let resp = test::call_service(&app, req).await;
        assert!(resp.status().is_success());
    }

    // 6th request for IP1 (should hit rate limit)
    let req = test::TestRequest::get()
        .uri(&format!("/api/v1/runes/transaction/{}", tx_id))
        .insert_header(("X-Real-IP", "192.168.1.1"))
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert_eq!(resp.status(), 429);
}

#[actix_web::test]
async fn test_rate_limit_multiple_endpoints() {
    let app = create_test_app().await;
    let tx_id = "a".repeat(64);
    let address = "bc1qtest";

    // Farklı endpoint'lere toplam 5 istek
    for i in 0..5 {
        let req = if i % 2 == 0 {
            test::TestRequest::get()
                .uri(&format!("/api/v1/runes/transaction/{}", tx_id))
                .insert_header(("X-Real-IP", "192.168.1.2"))
                .to_request()
        } else {
            test::TestRequest::get()
                .uri(&format!("/api/v1/runes/address/{}/transfers", address))
                .insert_header(("X-Real-IP", "192.168.1.2"))
                .to_request()
        };

        let resp = test::call_service(&app, req).await;
        assert!(resp.status().is_success());
    }

    // 6. istek rate limit'e takılmalı
    let req = test::TestRequest::get()
        .uri(&format!("/api/v1/runes/transaction/{}", tx_id))
        .insert_header(("X-Real-IP", "192.168.1.2"))
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert_eq!(resp.status(), 429);
}

#[actix_web::test]
async fn test_rate_limit_different_ips() {
    let app = create_test_app().await;
    let tx_id = "a".repeat(64);

    // First IP için 5 istek
    for _ in 0..5 {
        let req = test::TestRequest::get()
            .uri(&format!("/api/v1/runes/transaction/{}", tx_id))
            .insert_header(("X-Real-IP", "192.168.1.3"))
            .to_request();

        let resp = test::call_service(&app, req).await;
        assert!(resp.status().is_success());
    }

    // Second IP için 5 istek (başarılı olmalı)
    for _ in 0..5 {
        let req = test::TestRequest::get()
            .uri(&format!("/api/v1/runes/transaction/{}", tx_id))
            .insert_header(("X-Real-IP", "192.168.1.4"))
            .to_request();

        let resp = test::call_service(&app, req).await;
        assert!(resp.status().is_success());
    }

    // First IP için 6. istek (rate limit'e takılmalı)
    let req = test::TestRequest::get()
        .uri(&format!("/api/v1/runes/transaction/{}", tx_id))
        .insert_header(("X-Real-IP", "192.168.1.3"))
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert_eq!(resp.status(), 429);
}

#[actix_web::test]
async fn test_rate_limit_batch_requests() {
    let app = create_test_app().await;
    let tx_ids = vec!["a".repeat(64), "b".repeat(64)];

    // İlk 5 batch istek
    for _ in 0..5 {
        let req = test::TestRequest::post()
            .uri("/api/v1/runes/transactions/batch")
            .insert_header(("X-Real-IP", "192.168.1.5"))
            .set_json(&BatchTransactionRequest {
                transaction_ids: tx_ids.clone(),
                include_confirmations: true,
            })
            .to_request();

        let resp = test::call_service(&app, req).await;
        assert!(resp.status().is_success());
    }

    // 6. batch istek rate limit'e takılmalı
    let req = test::TestRequest::post()
        .uri("/api/v1/runes/transactions/batch")
        .insert_header(("X-Real-IP", "192.168.1.5"))
        .set_json(&BatchTransactionRequest {
            transaction_ids: tx_ids.clone(),
            include_confirmations: true,
        })
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert_eq!(resp.status(), 429);
} 