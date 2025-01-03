use actix_web::web;
use super::handlers::{register_webhook, unregister_webhook};

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/v1/webhooks")
            .route("", web::post().to(register_webhook))
            .route("/{url}", web::delete().to(unregister_webhook))
    );
} 