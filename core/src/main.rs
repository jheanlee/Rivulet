use axum::routing::get_service;
use clap::Parser;
use tokio::sync::OnceCell;
use tower_http::services::ServeDir;
use crate::common::args::Args;
use crate::common::log;
use crate::common::shared::{Config, Shared};

mod common;
mod media;

pub static CONFIG: OnceCell<Config> = OnceCell::const_new();
pub static SHARED: OnceCell<Shared> = OnceCell::const_new();

#[tokio::main]
async fn main() {
  let args = Args::parse();
  
  CONFIG.set(Config {
    log_config: log::init(args.verbose, args.log_level, !args.daemon_mode, args.daemon_mode)
      .unwrap_or_else(|err| panic!("{err}")),
    media_root: args.media_root,
    stream_serve_root: args.stream_root,
  }).expect("unable to set shared values");

  tokio::fs::create_dir_all(CONFIG.get().unwrap().media_root.as_str()).await.expect("failed to create media directory");
  tokio::fs::create_dir_all(CONFIG.get().unwrap().stream_serve_root.as_str()).await.expect("failed to create stream directory");

  let app = axum::Router::new()
    .nest_service("/stream", get_service(ServeDir::new(CONFIG.get().unwrap().stream_serve_root.as_str())));
  let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();
  axum::serve(listener, app).await.unwrap();
}
