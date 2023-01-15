use axum::{routing::get, Router};
use std::net::SocketAddr;

mod utils;
use utils::routes::*;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    start_server().await;
    Ok(())
}

async fn start_server() {
    let app = Router::new()
        .route("/", get(index))
        .route("/ws", get(ws_handler))
        .fallback(fallback);

    let addr = SocketAddr::from(([0, 0, 0, 0], 8000));
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
