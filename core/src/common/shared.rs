use std::collections::HashSet;
use std::future::Future;
use std::pin::Pin;
use std::sync::Arc;
use sea_orm::DatabaseConnection;
use tokio::sync::{mpsc, RwLock};
use crate::auth::key::JwtKeys;
use crate::common::log::LogConfig;

#[derive(Debug)]
pub struct Config {
  pub log_config: LogConfig,

  pub media_root: String,
  pub tmp_dir: String,
  pub stream_root: String,

  pub hardware_acceleration: bool
}

pub struct Shared {
  pub database_connection: DatabaseConnection,
  pub ffmpeg_hls_processes_running: Arc<RwLock<HashSet<String>>>,
  pub ffmpeg_hls_process_sender: mpsc::Sender<(String, Pin<Box<dyn Future<Output=()> + Send + 'static>>)>,
  pub jwt_keys_refresh: JwtKeys,
  pub jwt_keys_access: JwtKeys,
}