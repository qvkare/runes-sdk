use std::task::{Context, Poll};
use actix_web::{
    dev::{Service, ServiceRequest, ServiceResponse, Transform},
    Error, HttpMessage,
};
use futures::future::{ok, Ready};
use futures::Future;
use std::pin::Pin;
use uuid::Uuid;

pub struct RequestId;

impl RequestId {
    pub fn new() -> Self {
        RequestId
    }
}

impl<S, B> Transform<S, ServiceRequest> for RequestId
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type InitError = ();
    type Transform = RequestIdMiddleware<S>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ok(RequestIdMiddleware { service })
    }
}

pub struct RequestIdMiddleware<S> {
    service: S,
}

impl<S, B> Service<ServiceRequest> for RequestIdMiddleware<S>
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

    fn call(&self, mut req: ServiceRequest) -> Self::Future {
        // Generate Request ID
        let request_id = if let Some(existing_id) = req.headers().get("X-Request-ID") {
            existing_id.to_str().unwrap_or_default().to_string()
        } else {
            Uuid::new_v4().to_string()
        };

        // Request ID'yi request extensions'a ekle
        req.extensions_mut().insert(request_id.clone());

        // Request header'ına ekle
        req.headers_mut().insert(
            "X-Request-ID",
            actix_web::http::header::HeaderValue::from_str(&request_id).unwrap(),
        );

        let fut = self.service.call(req);

        Box::pin(async move {
            let mut res = fut.await?;
            
            // Response header'ına da ekle
            res.headers_mut().insert(
                "X-Request-ID",
                actix_web::http::header::HeaderValue::from_str(&request_id).unwrap(),
            );

            Ok(res)
        })
    }
} 