use actix_web::{web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use utoipa::ToSchema;

use crate::services::{
    node::connection::NodeConnection,
    cache::RunesCache,
};
use crate::types::{
    error::RuneError,
    rune::{RunesTransactionResponse, RuneTransfer},
};

pub struct RunesApiContext {
    pub node: Arc<NodeConnection>,
    pub cache: Arc<RunesCache>,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct BatchTransactionRequest {
    #[schema(example = "['tx1', 'tx2']")]
    pub transaction_ids: Vec<String>,
    #[schema(default = false)]
    pub include_confirmations: bool,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct BatchTransactionResponse {
    pub transactions: Vec<RunesTransactionResponse>,
    pub failed_transactions: Vec<String>,
}

/// Get transaction details by ID
#[utoipa::path(
    get,
    path = "/api/v1/runes/transaction/{tx_id}",
    responses(
        (status = 200, description = "Transaction found successfully", body = RunesTransactionResponse),
        (status = 400, description = "Invalid transaction ID format", body = ErrorResponse),
        (status = 404, description = "Transaction not found", body = ErrorResponse),
        (status = 429, description = "Too many requests", body = ErrorResponse),
        (status = 503, description = "Node connection error", body = ErrorResponse),
    ),
    params(
        ("tx_id" = String, Path, description = "Transaction ID to lookup")
    ),
    security(
        ("api_key" = [])
    ),
    tag = "transactions"
)]
pub async fn get_transaction(
    tx_id: web::Path<String>,
    context: web::Data<RunesApiContext>,
) -> impl Responder {
    // Önce cache'i kontrol et
    if let Some(cached_tx) = context.cache.get_transaction(&tx_id).await {
        return HttpResponse::Ok().json(cached_tx.as_ref());
    }

    // Cache'de yoksa node'dan al
    match context.node.get_transaction(&tx_id).await {
        Ok(tx) => {
            // Başarılı sonucu cache'e kaydet
            if let Err(e) = context.cache.set_transaction(tx_id.to_string(), tx.clone()).await {
                tracing::error!("Failed to cache transaction {}: {}", tx_id, e);
            }
            HttpResponse::Ok().json(tx)
        }
        Err(e) => {
            tracing::error!("Failed to get transaction {}: {}", tx_id, e);
            HttpResponse::InternalServerError().json(e.to_string())
        }
    }
}

/// Get multiple transactions in a single request
#[utoipa::path(
    post,
    path = "/api/v1/runes/transactions/batch",
    request_body = BatchTransactionRequest,
    responses(
        (status = 200, description = "Transactions retrieved successfully", body = BatchTransactionResponse),
        (status = 400, description = "Invalid request format", body = ErrorResponse),
        (status = 429, description = "Too many requests", body = ErrorResponse),
        (status = 503, description = "Node connection error", body = ErrorResponse),
    ),
    security(
        ("api_key" = [])
    ),
    tag = "transactions"
)]
pub async fn get_batch_transactions(
    request: web::Json<BatchTransactionRequest>,
    context: web::Data<RunesApiContext>,
) -> impl Responder {
    let mut response = BatchTransactionResponse {
        transactions: Vec::new(),
        failed_transactions: Vec::new(),
    };

    for tx_id in &request.transaction_ids {
        // Önce cache'i kontrol et
        if let Some(cached_tx) = context.cache.get_transaction(tx_id).await {
            response.transactions.push(cached_tx.as_ref().clone());
            continue;
        }

        // Cache'de yoksa node'dan al
        match context.node.get_transaction(tx_id).await {
            Ok(tx) => {
                // Başarılı sonucu cache'e kaydet
                if let Err(e) = context.cache.set_transaction(tx_id.to_string(), tx.clone()).await {
                    tracing::error!("Failed to cache transaction {}: {}", tx_id, e);
                }
                response.transactions.push(tx);
            }
            Err(e) => {
                tracing::error!("Failed to get transaction {}: {}", tx_id, e);
                response.failed_transactions.push(tx_id.clone());
            }
        }
    }

    HttpResponse::Ok().json(response)
}

/// Get all Rune transfers for a specific address
#[utoipa::path(
    get,
    path = "/api/v1/runes/address/{address}/transfers",
    responses(
        (status = 200, description = "Transfers retrieved successfully", body = Vec<RuneTransfer>),
        (status = 400, description = "Invalid address format", body = ErrorResponse),
        (status = 429, description = "Too many requests", body = ErrorResponse),
        (status = 503, description = "Node connection error", body = ErrorResponse),
    ),
    params(
        ("address" = String, Path, description = "Bitcoin address to lookup")
    ),
    security(
        ("api_key" = [])
    ),
    tag = "transactions"
)]
pub async fn get_address_transfers(
    address: web::Path<String>,
    context: web::Data<RunesApiContext>,
) -> impl Responder {
    // Önce cache'i kontrol et
    if let Some(cached_transfers) = context.cache.get_address_transfers(&address).await {
        return HttpResponse::Ok().json(cached_transfers.as_ref());
    }

    // Cache'de yoksa node'dan al
    match context.node.get_address_transfers(&address).await {
        Ok(transfers) => {
            // Başarılı sonucu cache'e kaydet
            if let Err(e) = context.cache.set_address_transfers(address.to_string(), transfers.clone()).await {
                tracing::error!("Failed to cache address transfers {}: {}", address, e);
            }
            HttpResponse::Ok().json(transfers)
        }
        Err(e) => {
            tracing::error!("Failed to get address transfers {}: {}", address, e);
            HttpResponse::InternalServerError().json(e.to_string())
        }
    }
} 