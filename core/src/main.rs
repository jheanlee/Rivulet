use axum::routing::get_service;
use clap::Parser;
use tokio::sync::OnceCell;
use tower_http::services::ServeDir;
use crate::common::args::Args;
use crate::common::shared::Shared;

mod common;
mod media;

pub static SHARED: OnceCell<Shared> = OnceCell::const_new();
#[tokio::main]
async fn main() {
  let args = Args::parse();
  SHARED.set(Shared{
    media_root: args.media_root,
    stream_serve_root: args.stream_root,
  }).expect("unable to set shared values");

  tokio::fs::create_dir_all(SHARED.get().unwrap().media_root.as_str()).await.expect("failed to create media directory");
  tokio::fs::create_dir_all(SHARED.get().unwrap().stream_serve_root.as_str()).await.expect("failed to create stream directory");

  let app = axum::Router::new()
    .nest_service("/stream", get_service(ServeDir::new(SHARED.get().unwrap().stream_serve_root.as_str())));
  let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();
  axum::serve(listener, app).await.unwrap();
}
