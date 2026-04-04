use tokio::fs::remove_dir_all;
use tokio::io;
use crate::common::error::ApiError;

pub async fn remove_dir_all_if_exists(path: &str) -> Result<(), ApiError> {
  match remove_dir_all(path).await {
    Ok(_) => Ok(()),
    Err(ref error) if error.kind() == io::ErrorKind::NotFound => Ok(()),
    Err(err) => Err(err.into())
  }
}