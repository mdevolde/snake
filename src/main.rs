use anyhow::{Context, Result};
use axum::{routing::get, Router};
use axum_extra::routing::SpaRouter;
use std::net::SocketAddr;

mod utils;
use utils::routes::*;

#[tokio::main]
async fn main() -> Result<()> {
    start_server().await
}

async fn start_server() -> Result<()> {
    let app = Router::new()
        .route("/", get(index))
        .route("/ws", get(ws_handler))
        .merge(SpaRouter::new("/assets", "assets").index_file("index.html"))
        .fallback(fallback);

    let addr = SocketAddr::from(([0, 0, 0, 0], 8000));
    axum::Server::try_bind(&addr)
        .context("Failed to bind to address. Is the port already in use? Or do you have permission to bind to this port?")?
        .serve(app.into_make_service())
        .await?;

    Ok(())
}
