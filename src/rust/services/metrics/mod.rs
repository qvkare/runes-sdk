use std::sync::Arc;
use prometheus::{
    Counter, Gauge, Histogram, HistogramOpts, HistogramVec,
    IntCounter, IntCounterVec, IntGauge, IntGaugeVec,
    Registry, TextEncoder,
};
use lazy_static::lazy_static;

lazy_static! {
    pub static ref REGISTRY: Registry = Registry::new();
    
    // HTTP metrikleri
    pub static ref HTTP_REQUESTS_TOTAL: IntCounterVec = IntCounterVec::new(
        opts!("http_requests_total", "Total number of HTTP requests"),
        &["method", "path", "status"]
    ).unwrap();
    
    pub static ref HTTP_REQUEST_DURATION_SECONDS: HistogramVec = HistogramVec::new(
        HistogramOpts::new(
            "http_request_duration_seconds",
            "HTTP request duration in seconds"
        ),
        &["method", "path"]
    ).unwrap();
    
    pub static ref HTTP_IN_FLIGHT_REQUESTS: IntGauge = IntGauge::new(
        "http_in_flight_requests",
        "Current number of in-flight HTTP requests"
    ).unwrap();
    
    // Cache metrikleri
    pub static ref CACHE_HITS_TOTAL: IntCounterVec = IntCounterVec::new(
        opts!("cache_hits_total", "Total number of cache hits"),
        &["cache_type"]
    ).unwrap();
    
    pub static ref CACHE_MISSES_TOTAL: IntCounterVec = IntCounterVec::new(
        opts!("cache_misses_total", "Total number of cache misses"),
        &["cache_type"]
    ).unwrap();
    
    pub static ref CACHE_SIZE: IntGaugeVec = IntGaugeVec::new(
        opts!("cache_size", "Current size of cache"),
        &["cache_type"]
    ).unwrap();
    
    // Node connection metrics
    pub static ref NODE_REQUESTS_TOTAL: IntCounterVec = IntCounterVec::new(
        opts!("node_requests_total", "Total number of requests to node"),
        &["method"]
    ).unwrap();
    
    pub static ref NODE_REQUEST_FAILURES_TOTAL: IntCounterVec = IntCounterVec::new(
        opts!("node_request_failures_total", "Total number of failed requests to node"),
        &["method"]
    ).unwrap();
    
    pub static ref NODE_REQUEST_DURATION_SECONDS: HistogramVec = HistogramVec::new(
        HistogramOpts::new(
            "node_request_duration_seconds",
            "Node request duration in seconds"
        ),
        &["method"]
    ).unwrap();
    
    // Webhook metrikleri
    pub static ref WEBHOOK_DELIVERIES_TOTAL: IntCounterVec = IntCounterVec::new(
        opts!("webhook_deliveries_total", "Total number of webhook deliveries"),
        &["status"]
    ).unwrap();
    
    pub static ref WEBHOOK_DELIVERY_DURATION_SECONDS: Histogram = Histogram::with_opts(
        HistogramOpts::new(
            "webhook_delivery_duration_seconds",
            "Webhook delivery duration in seconds"
        )
    ).unwrap();
    
    pub static ref WEBHOOK_RETRY_COUNT: IntCounter = IntCounter::new(
        "webhook_retry_count",
        "Total number of webhook delivery retries"
    ).unwrap();
}

pub fn register_metrics() {
    // HTTP metrikleri
    REGISTRY.register(Box::new(HTTP_REQUESTS_TOTAL.clone())).unwrap();
    REGISTRY.register(Box::new(HTTP_REQUEST_DURATION_SECONDS.clone())).unwrap();
    REGISTRY.register(Box::new(HTTP_IN_FLIGHT_REQUESTS.clone())).unwrap();
    
    // Cache metrikleri
    REGISTRY.register(Box::new(CACHE_HITS_TOTAL.clone())).unwrap();
    REGISTRY.register(Box::new(CACHE_MISSES_TOTAL.clone())).unwrap();
    REGISTRY.register(Box::new(CACHE_SIZE.clone())).unwrap();
    
    // Node connection metrics
    REGISTRY.register(Box::new(NODE_REQUESTS_TOTAL.clone())).unwrap();
    REGISTRY.register(Box::new(NODE_REQUEST_FAILURES_TOTAL.clone())).unwrap();
    REGISTRY.register(Box::new(NODE_REQUEST_DURATION_SECONDS.clone())).unwrap();
    
    // Webhook metrikleri
    REGISTRY.register(Box::new(WEBHOOK_DELIVERIES_TOTAL.clone())).unwrap();
    REGISTRY.register(Box::new(WEBHOOK_DELIVERY_DURATION_SECONDS.clone())).unwrap();
    REGISTRY.register(Box::new(WEBHOOK_RETRY_COUNT.clone())).unwrap();
}

pub fn metrics_handler() -> String {
    let encoder = TextEncoder::new();
    let metric_families = REGISTRY.gather();
    let mut buffer = Vec::new();
    encoder.encode(&metric_families, &mut buffer).unwrap();
    String::from_utf8(buffer).unwrap()
} 