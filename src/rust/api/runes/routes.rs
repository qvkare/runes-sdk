use actix_web::web;
use super::handlers::{get_transaction, get_batch_transactions, get_address_transfers};

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/v1/runes")
            .route("/transaction/{tx_id}", web::get().to(get_transaction))
            .route("/transactions/batch", web::post().to(get_batch_transactions))
            .route("/address/{address}/transfers", web::get().to(get_address_transfers))
    );
} 