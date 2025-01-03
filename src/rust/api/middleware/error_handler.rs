use std::task::{Context, Poll};
use actix_web::{
    dev::{Service, ServiceRequest, ServiceResponse, Transform},
    Error, HttpMessage, HttpResponse,
};
use futures::future::{ok, Ready};
use futures::Future;
use std::pin::Pin;
use tracing::{error, warn};

use crate::types::error::{RuneError, ErrorResponse};

pub struct ErrorHandler;

impl ErrorHandler {
    pub fn new() -> Self {
        ErrorHandler
    }
}

impl<S, B> Transform<S, ServiceRequest> for ErrorHandler
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type InitError = ();
    type Transform = ErrorHandlerMiddleware<S>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ok(ErrorHandlerMiddleware { service })
    }
}

pub struct ErrorHandlerMiddleware<S> {
    service: S,
}

impl<S, B> Service<ServiceRequest> for ErrorHandlerMiddleware<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>>>>;

    fn poll_ready(&self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.service.poll_ready(cx)
    }

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let fut = self.service.call(req);

        Box::pin(async move {
            match fut.await {
                Ok(res) => Ok(res),
                Err(err) => {
                    // Request ID'yi al
                    let request_id = if let Some(extensions) = fut.await.ok().map(|r| r.request().extensions()) {
                        extensions.get::<String>().cloned()
                    } else {
                        None
                    };

                    // Hatayı logla
                    match err.as_response_error() {
                        e if e.status().is_server_error() => {
                            error!(
                                "Server error occurred: {} (status: {}, request_id: {:?})",
                                e,
                                e.status(),
                                request_id
                            );
                        }
                        e => {
                            warn!(
                                "Client error occurred: {} (status: {}, request_id: {:?})",
                                e,
                                e.status(),
                                request_id
                            );
                        }
                    }

                    // Hata yanıtını oluştur
                    let error_response = match err.as_error::<RuneError>() {
                        Some(rune_error) => ErrorResponse {
                            code: rune_error.error_code(),
                            message: rune_error.to_string(),
                            details: rune_error.error_details(),
                            request_id,
                        },
                        None => ErrorResponse {
                            code: "INTERNAL_ERROR".to_string(),
                            message: "An unexpected error occurred".to_string(),
                            details: None,
                            request_id,
                        },
                    };

                    // HTTP status code'unu belirle
                    let status_code = err.as_response_error().status();
                    
                    Ok(ServiceResponse::new(
                        fut.await.unwrap().request().clone(),
                        HttpResponse::build(status_code).json(error_response),
                    ))
                }
            }
        })
    }
} 