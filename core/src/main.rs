use axum::extract::DefaultBodyLimit;
use axum::middleware;
use axum::routing::{delete, get, get_service, patch, post, put};
use clap::Parser;
use tokio::sync::OnceCell;
use tower_http::services::ServeDir;
use crate::api::auth::{login, refresh_token, verify_admin, verify_jwt};
use crate::api::serve::serve_media;
use crate::api::upload::{upload_file, upload_metadata};
use crate::api::users::{check_username_availability, delete_user, list_users, modify_user, new_user, reset_password, set_admin};
use crate::auth::key::init_jwt_keys;
use crate::common::args::Args;
use crate::common::log;
use crate::common::shared::{Config, Shared};
use crate::orm::database::connect_database;

mod common;
mod auth;
mod api;
mod orm;
mod file;

pub static CONFIG: OnceCell<Config> = OnceCell::const_new();
pub static SHARED: OnceCell<Shared> = OnceCell::const_new();

#[tokio::main]
async fn main() {
  let _ = dotenv::dotenv();
  let args = Args::parse();
  
  CONFIG.set(Config {
    log_config: log::init(args.verbose, args.log_level, !args.daemon_mode, args.daemon_mode)
      .expect("unsupported platform"),
    media_root: std::env::var("RIVULET_MEDIA")
      .expect("a valid path to the media storage folder must be provided via the environment variable `RIVULET_MEDIA`"),
    tmp_dir: std::env::var("RIVULET_TMP")
      .unwrap_or("/tmp/rivulet".to_string()),
    stream_root: std::env::var("RIVULET_STREAM")
      .expect("a valid path to the media storage folder must be provided via the environment variable `RIVULET_STREAM`"),
  }).unwrap_or_else(|err| panic!("{err}"));
  
  SHARED.set(Shared {
    database_connection: connect_database(
      std::env::var("RIVULET_DATABASE")
        .expect("a database url must be provided via the environment variable `RIVULET_DATABASE`"),
    ).await
      .expect("unable to connect to database"),
    jwt_keys_refresh: init_jwt_keys("REFRESH").await
      .expect("a valid path to a key pair must be provided via the environment variables `RIVULET_JWT_REFRESH_PRIV_KEY` and `RIVULET_JWT_REFRESH_PUB_KEY`"),
    jwt_keys_access: init_jwt_keys("ACCESS").await
      .expect("a valid path to a key pair must be provided via the environment variables `RIVULET_JWT_ACCESS_PRIV_KEY` and `RIVULET_JWT_ACCESS_PUB_KEY`"),
  }).unwrap_or_else(|err| panic!("{err}"));

  tokio::fs::create_dir_all(CONFIG.get().unwrap().media_root.as_str()).await.expect("failed to create media directory");
  tokio::fs::create_dir_all(CONFIG.get().unwrap().stream_root.as_str()).await.expect("failed to create stream directory");

  let app = axum::Router::new()
    .route("/api/users/check-username", get(check_username_availability))
    .route("/api/users", get(list_users))
    .route("/api/users", post(new_user))
    .route("/api/users/{user_id}", put(modify_user))
    .route("/api/users/{user_id}/set-admin", patch(set_admin))
    .route("/api/users/{user_id}/reset-password", patch(reset_password))
    .route("/api/users/{user_id}", delete(delete_user))
    .route("/api/media/upload", post(upload_file)
      .layer(DefaultBodyLimit::max(21 * 1024 * 1024)))
    .route("/api/media/upload/metadata", post(upload_metadata))
    .layer(middleware::from_fn(verify_admin))
    .route("/api/media/{media_id}/serve", post(serve_media))
    .nest_service("/api/media/stream", get_service(ServeDir::new(CONFIG.get().unwrap().stream_root.as_str())))
    // .layer(middleware::from_fn(verify_jwt))  TODO
    .route("/api/auth/login", post(login))
    .route("/api/auth/refresh-token", post(refresh_token));

  let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();
  axum::serve(listener, app).await.unwrap();
}
