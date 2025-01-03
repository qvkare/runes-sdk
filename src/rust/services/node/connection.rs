use std::sync::Arc;
use std::time::Duration;
use reqwest::Client as HttpClient;
use crate::types::error::RuneError;
use metrics::{Counter, Gauge, Histogram};

#[derive(Debug, Clone)]
pub struct NodeConfig {
    pub rpc_url: String,
    pub username: Option<String>,
    pub password: Option<String>,
    pub timeout: Duration,
    pub max_retries: u32,
}

pub struct NodeConnection {
    config: NodeConfig,
    client: Arc<HttpClient>,
    metrics: Arc<MetricsCollector>,
}

pub struct MetricsCollector {
    pub transaction_counter: Counter,
    pub error_counter: Counter,
    pub response_time: Histogram,
    pub active_connections: Gauge,
}

#[derive(Debug, Clone)]
pub struct NodeStatus {
    pub is_connected: bool,
    pub block_height: u64,
    pub peer_count: u32,
    pub sync_progress: f64,
}

impl NodeConnection {
    pub fn new(config: NodeConfig, metrics: Arc<MetricsCollector>) -> Self {
        let client = HttpClient::builder()
            .timeout(config.timeout)
            .build()
            .expect("Failed to create HTTP client");

        Self {
            config,
            client: Arc::new(client),
            metrics,
        }
    }

    pub async fn connect(&self) -> Result<(), RuneError> {
        let _metrics_guard = self.metrics.active_connections.increment(1.0);
        
        for attempt in 0..self.config.max_retries {
            match self.health_check().await {
                Ok(_) => {
                    tracing::info!("Successfully connected to node");
                    return Ok(());
                }
                Err(e) => {
                    if attempt == self.config.max_retries - 1 {
                        return Err(e);
                    }
                    tracing::warn!("Connection attempt {} failed: {}", attempt + 1, e);
                    tokio::time::sleep(Duration::from_secs(2_u64.pow(attempt))).await;
                }
            }
        }

        Err(RuneError::NodeConnectionError("Max retries exceeded".to_string()))
    }

    pub async fn health_check(&self) -> Result<NodeStatus, RuneError> {
        let timer = self.metrics.response_time.start_timer();
        
        let response = self.client
            .get(&format!("{}/health", self.config.rpc_url))
            .send()
            .await
            .map_err(RuneError::NetworkError)?;

        timer.observe_duration();

        if !response.status().is_success() {
            self.metrics.error_counter.increment(1);
            return Err(RuneError::NodeConnectionError(
                format!("Health check failed with status: {}", response.status())
            ));
        }

        let status: NodeStatus = response
            .json()
            .await
            .map_err(|e| RuneError::NodeConnectionError(format!("Failed to parse status: {}", e)))?;

        Ok(status)
    }

    pub async fn get_block_height(&self) -> Result<u64, RuneError> {
        let response = self.client
            .get(&format!("{}/blocks/tip/height", self.config.rpc_url))
            .send()
            .await
            .map_err(RuneError::NetworkError)?;

        if !response.status().is_success() {
            return Err(RuneError::NodeConnectionError(
                "Failed to get block height".to_string()
            ));
        }

        let height = response
            .text()
            .await
            .map_err(|e| RuneError::NodeConnectionError(format!("Failed to parse height: {}", e)))?
            .parse::<u64>()
            .map_err(|e| RuneError::NodeConnectionError(format!("Invalid height format: {}", e)))?;

        Ok(height)
    }
} 