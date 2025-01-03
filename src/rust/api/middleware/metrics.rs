use std::future::Future;
use std::pin::Pin;
use std::task::{Context, Poll};
use std::time::Instant;

use actix_web::dev::{Service, ServiceRequest, ServiceResponse, Transform};
use actix_web::Error;
use futures::future::LocalBoxFuture;

use crate::services::metrics::{
    HTTP_REQUESTS_TOTAL,
    HTTP_REQUEST_DURATION_SECONDS,
    HTTP_IN_FLIGHT_REQUESTS,
};

pub struct MetricsMiddleware;

impl<S, B> Transform<S, ServiceRequest> for MetricsMiddleware
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type InitError = ();
    type Transform = MetricsMiddlewareService<S>;
    type Future = LocalBoxFuture<'static, Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        Box::pin(async move { Ok(MetricsMiddlewareService { service }) })
    }
}

pub struct MetricsMiddlewareService<S> {
    service: S,
}

impl<S, B> Service<ServiceRequest> for MetricsMiddlewareService<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    fn poll_ready(&self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.service.poll_ready(cx)
    }

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let start = Instant::now();
        let method = req.method().as_str().to_string();
        let path = req.path().to_string();

        // İşlemdeki istekleri artır
        HTTP_IN_FLIGHT_REQUESTS.inc();

        let fut = self.service.call(req);
        Box::pin(async move {
            let res = fut.await;
            
            // İşlemdeki istekleri azalt
            HTTP_IN_FLIGHT_REQUESTS.dec();

            match &res {
                Ok(response) => {
                    // İstek sayısını artır
                    HTTP_REQUESTS_TOTAL
                        .with_label_values(&[
                            &method,
                            &path,
                            response.status().as_str(),
                        ])
                        .inc();

                    // İstek süresini kaydet
                    HTTP_REQUEST_DURATION_SECONDS
                        .with_label_values(&[&method, &path])
                        .observe(start.elapsed().as_secs_f64());
                }
                Err(_) => {
                    // Hatalı istekleri kaydet
                    HTTP_REQUESTS_TOTAL
                        .with_label_values(&[&method, &path, "error"])
                        .inc();
                }
            }

            res
        })
    }
} 