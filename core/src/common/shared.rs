use sea_orm::DatabaseConnection;
use crate::auth::key::JwtKeys;
use crate::common::log::LogConfig;

#[derive(Debug)]
pub struct Config {
  pub log_config: LogConfig,

  pub media_root: String,
  pub stream_serve_root: String,
  // pub thumbnail_root: String,
}

pub struct Shared {
  pub database_connection: DatabaseConnection,
  pub jwt_keys_refresh: JwtKeys,
  pub jwt_keys_access: JwtKeys,
}