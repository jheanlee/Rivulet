use axum::middleware;
use axum::routing::{get_service, post};
use clap::Parser;
use tokio::sync::OnceCell;
use tower_http::services::ServeDir;
use crate::api::auth::{login, refresh_token, verify_admin, verify_jwt};
use crate::auth::key::init_jwt_keys;
use crate::common::args::Args;
use crate::common::log;
use crate::common::shared::{Config, Shared};
use crate::orm::database::connect_database;

mod common;
mod media;
mod auth;
mod api;
mod orm;

pub static CONFIG: OnceCell<Config> = OnceCell::const_new();
pub static SHARED: OnceCell<Shared> = OnceCell::const_new();


#[tokio::main]
async fn main() {
  dotenv::dotenv().unwrap();
  let args = Args::parse();
  
  CONFIG.set(Config {
    log_config: log::init(args.verbose, args.log_level, !args.daemon_mode, args.daemon_mode)
      .expect("unsupported platform"),
    media_root: args.media_root,
    stream_serve_root: args.stream_root,
  }).unwrap_or_else(|err| panic!("{err}"));
  
  SHARED.set(Shared {
    database_connection: connect_database(args.database_url).await
      .expect("unable to connect to database"),
    jwt_keys_refresh: init_jwt_keys("REFRESH").await
      .expect("a valid path to a key pair must be provided through `JWT_REFRESH_PRIV_KEY_PATH` and `JWT_REFRESH_PUB_KEY_PATH` environment variables"),
    jwt_keys_access: init_jwt_keys("ACCESS").await
      .expect("a valid path to a key pair must be provided through `JWT_ACCESS_PRIV_KEY_PATH` and `JWT_ACCESS_PUB_KEY_PATH` environment variables"),
  }).unwrap_or_else(|err| panic!("{err}"));

  // tokio::fs::create_dir_all(CONFIG.get().unwrap().media_root.as_str()).await.expect("failed to create media directory");
  // tokio::fs::create_dir_all(CONFIG.get().unwrap().stream_serve_root.as_str()).await.expect("failed to create stream directory");

  let app = axum::Router::new()
    .layer(middleware::from_fn(verify_admin))
    .nest_service("/stream", get_service(ServeDir::new(CONFIG.get().unwrap().stream_serve_root.as_str())))
    .layer(middleware::from_fn(verify_jwt))
    .route("/api/users/login", post(login))
    .route("/api/refresh-token", post(refresh_token));

  let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();
  axum::serve(listener, app).await.unwrap();
}
