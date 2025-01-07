use std::sync::Arc;
use std::time::Duration;
use metrics::{Counter, Gauge, Histogram};
use mockall::predicate::*;
use crate::services::node::connection::{NodeConfig, NodeConnection, MetricsCollector, NodeStatus};

#[tokio::test]
async fn test_successful_connection() {
    let config = NodeConfig {
        rpc_url: "http://localhost:8332".to_string(),
        username: None,
        password: None,
        timeout: Duration::from_secs(30),
        max_retries: 3,
    };

    let metrics = Arc::new(MetricsCollector {
        transaction_counter: Counter::new("test_tx_counter"),
        error_counter: Counter::new("test_error_counter"),
        response_time: Histogram::new("test_response_time"),
        active_connections: Gauge::new("test_active_connections"),
    });

    let node = NodeConnection::new(config, metrics);
    let result = node.connect().await;
    assert!(result.is_ok());
}

#[tokio::test]
async fn test_health_check() {
    let config = NodeConfig {
        rpc_url: "http://localhost:8332".to_string(),
        username: None,
        password: None,
        timeout: Duration::from_secs(30),
        max_retries: 3,
    };

    let metrics = Arc::new(MetricsCollector {
        transaction_counter: Counter::new("test_tx_counter"),
        error_counter: Counter::new("test_error_counter"),
        response_time: Histogram::new("test_response_time"),
        active_connections: Gauge::new("test_active_connections"),
    });

    let node = NodeConnection::new(config, metrics);
    let result = node.health_check().await;
    
    match result {
        Ok(status) => {
            assert!(status.is_connected);
            assert!(status.block_height > 0);
            assert!(status.peer_count > 0);
            assert!(status.sync_progress >= 0.0 && status.sync_progress <= 1.0);
        },
        Err(e) => panic!("Health check failed: {}", e),
    }
}

#[tokio::test]
async fn test_get_block_height() {
    let config = NodeConfig {
        rpc_url: "http://localhost:8332".to_string(),
        username: None,
        password: None,
        timeout: Duration::from_secs(30),
        max_retries: 3,
    };

    let metrics = Arc::new(MetricsCollector {
        transaction_counter: Counter::new("test_tx_counter"),
        error_counter: Counter::new("test_error_counter"),
        response_time: Histogram::new("test_response_time"),
        active_connections: Gauge::new("test_active_connections"),
    });

    let node = NodeConnection::new(config, metrics);
    let result = node.get_block_height().await;
    
    assert!(result.is_ok());
    assert!(result.unwrap() > 0);
}

#[tokio::test]
async fn test_connection_retry() {
    let config = NodeConfig {
        rpc_url: "http://invalid-url:8332".to_string(),
        username: None,
        password: None,
        timeout: Duration::from_secs(1),
        max_retries: 2,
    };

    let metrics = Arc::new(MetricsCollector {
        transaction_counter: Counter::new("test_tx_counter"),
        error_counter: Counter::new("test_error_counter"),
        response_time: Histogram::new("test_response_time"),
        active_connections: Gauge::new("test_active_connections"),
    });

    let node = NodeConnection::new(config, metrics);
    let result = node.connect().await;
    
    assert!(result.is_err());
    match result {
        Err(e) => assert!(e.to_string().contains("Max retries exceeded")),
        _ => panic!("Expected error"),
    }
} 