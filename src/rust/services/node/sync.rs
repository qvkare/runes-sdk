use std::sync::Arc;
use tokio::sync::RwLock;
use crate::types::error::RuneError;
use super::connection::NodeConnection;

#[derive(Debug, Clone)]
pub struct SyncStatus {
    pub current_height: u64,
    pub target_height: u64,
    pub is_syncing: bool,
    pub progress: f64,
    pub estimated_time_remaining: Option<u64>,
}

pub struct SyncService {
    node: Arc<NodeConnection>,
    status: Arc<RwLock<SyncStatus>>,
    sync_interval: tokio::time::Duration,
}

impl SyncService {
    pub fn new(
        node: Arc<NodeConnection>,
        sync_interval: tokio::time::Duration,
    ) -> Self {
        let initial_status = SyncStatus {
            current_height: 0,
            target_height: 0,
            is_syncing: false,
            progress: 0.0,
            estimated_time_remaining: None,
        };

        Self {
            node,
            status: Arc::new(RwLock::new(initial_status)),
            sync_interval,
        }
    }

    pub async fn start_sync(&self) -> Result<(), RuneError> {
        let mut status = self.status.write().await;
        if status.is_syncing {
            return Ok(());
        }

        status.is_syncing = true;
        status.target_height = self.node.get_block_height().await?;
        drop(status);

        self.sync_blocks().await?;
        Ok(())
    }

    pub async fn stop_sync(&self) -> Result<(), RuneError> {
        let mut status = self.status.write().await;
        status.is_syncing = false;
        Ok(())
    }

    pub async fn get_sync_status(&self) -> Result<SyncStatus, RuneError> {
        Ok(self.status.read().await.clone())
    }

    async fn sync_blocks(&self) -> Result<(), RuneError> {
        while {
            let status = self.status.read().await;
            status.is_syncing && status.current_height < status.target_height
        } {
            let current_height = {
                let status = self.status.read().await;
                status.current_height
            };

            // Sync logic here
            // For example:
            // 1. Get block at current_height + 1
            // 2. Process block data
            // 3. Update current_height

            let mut status = self.status.write().await;
            status.current_height += 1;
            status.progress = status.current_height as f64 / status.target_height as f64;

            // Update estimated time remaining based on sync speed
            // This is a simplified calculation
            if status.current_height > 0 {
                let blocks_remaining = status.target_height - status.current_height;
                status.estimated_time_remaining = Some(blocks_remaining * 2); // Assume 2 seconds per block
            }

            drop(status);

            tokio::time::sleep(self.sync_interval).await;
        }

        let mut status = self.status.write().await;
        status.is_syncing = false;
        status.progress = 1.0;
        status.estimated_time_remaining = None;

        Ok(())
    }
} 