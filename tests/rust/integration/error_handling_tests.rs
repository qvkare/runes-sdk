use std::sync::Arc;
use std::time::Duration;
use actix_web::{test, web, App};
use serde_json::Value;

use crate::{
    api::{
        runes::{
            handlers::{RunesApiContext, BatchTransactionRequest},
            routes::configure_routes,
        },
        middleware::{
            rate_limit::RateLimitMiddleware,
            request_id::RequestId,
            error_handler::ErrorHandler,
        },
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
            .wrap(ErrorHandler::new())
            .wrap(RequestId::new())
            .wrap(RateLimitMiddleware::new(rate_limiter))
            .app_data(web::Data::new(context))
            .configure(configure_routes)
    ).await
}

#[actix_web::test]
async fn test_invalid_transaction_error() {
    let app = create_test_app().await;
    let tx_id = "invalid_tx_id"; // Geçersiz transaction ID

    let req = test::TestRequest::get()
        .uri(&format!("/api/v1/runes/transaction/{}", tx_id))
        .to_request();

    let resp = test::call_service(&app, req).await;
    
    assert_eq!(resp.status(), 400);

    let body: Value = test::read_body_json(resp).await;
    assert_eq!(body["code"], "INVALID_TRANSACTION");
    assert!(body["message"].as_str().unwrap().contains("Invalid transaction"));
    assert!(body["request_id"].as_str().is_some());
}

#[actix_web::test]
async fn test_rate_limit_error() {
    let app = create_test_app().await;
    let tx_id = "a".repeat(64);

    // Rate limit'i aş
    for _ in 0..6 {
        let req = test::TestRequest::get()
            .uri(&format!("/api/v1/runes/transaction/{}", tx_id))
            .to_request();

        let resp = test::call_service(&app, req).await;
        
        if resp.status() == 429 {
            let body: Value = test::read_body_json(resp).await;
            assert_eq!(body["code"], "RATE_LIMIT_EXCEEDED");
            assert!(body["message"].as_str().unwrap().contains("Rate limit exceeded"));
            assert!(body["details"]["retry_after"].as_i64().is_some());
            assert!(body["request_id"].as_str().is_some());
            return;
        }
    }

    panic!("Rate limit error was not triggered");
}

#[actix_web::test]
async fn test_invalid_address_error() {
    let app = create_test_app().await;
    let address = "invalid_address"; // Geçersiz adres

    let req = test::TestRequest::get()
        .uri(&format!("/api/v1/runes/address/{}/transfers", address))
        .to_request();

    let resp = test::call_service(&app, req).await;
    
    assert_eq!(resp.status(), 400);

    let body: Value = test::read_body_json(resp).await;
    assert_eq!(body["code"], "INVALID_ADDRESS");
    assert!(body["message"].as_str().unwrap().contains("Invalid address"));
    assert!(body["request_id"].as_str().is_some());
}

#[actix_web::test]
async fn test_request_id_propagation() {
    let app = create_test_app().await;
    let tx_id = "a".repeat(64);

    // Custom request ID ile istek yap
    let custom_request_id = "test-request-id-123";
    let req = test::TestRequest::get()
        .uri(&format!("/api/v1/runes/transaction/{}", tx_id))
        .insert_header(("X-Request-ID", custom_request_id))
        .to_request();

    let resp = test::call_service(&app, req).await;
    
    // Response header'ında aynı request ID olmalı
    assert_eq!(
        resp.headers().get("X-Request-ID").unwrap().to_str().unwrap(),
        custom_request_id
    );

    // Hata durumunda da request ID korunmalı
    let invalid_tx_id = "invalid";
    let req = test::TestRequest::get()
        .uri(&format!("/api/v1/runes/transaction/{}", invalid_tx_id))
        .insert_header(("X-Request-ID", custom_request_id))
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert_eq!(resp.status(), 400);

    let body: Value = test::read_body_json(resp).await;
    assert_eq!(body["request_id"], custom_request_id);
}

#[actix_web::test]
async fn test_internal_error_handling() {
    let app = create_test_app().await;
    
    // Node bağlantısı olmadığı için internal error almalıyız
    let req = test::TestRequest::get()
        .uri("/api/v1/runes/transaction/a".repeat(64))
        .to_request();

    let resp = test::call_service(&app, req).await;
    
    assert_eq!(resp.status(), 503); // Service Unavailable

    let body: Value = test::read_body_json(resp).await;
    assert_eq!(body["code"], "NODE_CONNECTION_ERROR");
    assert!(body["message"].as_str().unwrap().contains("Node connection error"));
    assert!(body["request_id"].as_str().is_some());
} 