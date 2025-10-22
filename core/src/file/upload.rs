use tokio::fs::{create_dir_all, read, remove_dir_all, remove_file, try_exists, write, File};
use tokio::io;
use tokio::io::AsyncWriteExt;
use crate::common::error::ApiError;
use crate::CONFIG;
use crate::orm::movie::{delete_movie_metadata, get_movie_storage_path};
use crate::orm::music::{delete_music_metadata, get_music_storage_path};
use crate::orm::video::{delete_video_metadata, get_video_storage_path};

const CHUNK_SIZE: usize = 20 * 1024 * 1024;

pub async fn write_chunk(upload_id: &str, chunk_id: u64, data: &[u8], end_of_file: bool) -> Result<(), ApiError> {
  match write_chunk_priv(upload_id, chunk_id, data, end_of_file).await {
    Ok(_) => Ok(()),
    Err(error) => {
      let _res = upload_cancel_cleanup(upload_id).await;
      Err(error)
    }
  }
}

pub async fn assemble_chunks(upload_id: &str, last_chunk_id: u64) -> Result<(), ApiError> {
  match assemble_chunks_priv(upload_id, last_chunk_id).await {
    Ok(_) => Ok(()),
    Err(error) => {
      let _res = upload_cancel_cleanup(upload_id).await;
      Err(error)
    }
  }
}

async fn write_chunk_priv(upload_id: &str, chunk_id: u64, data: &[u8], end_of_file: bool) -> Result<(), ApiError> {
  if end_of_file || data.len() == CHUNK_SIZE {
    let tmp_dir = &CONFIG.get().unwrap().tmp_dir;
    create_dir_all(format!("{tmp_dir}/{upload_id}")).await?;
    write(format!("{tmp_dir}/{upload_id}/chunk_{chunk_id}"), data).await?;
    Ok(())
  } else {
    Err(ApiError::BadRequest)
  }
}

async fn assemble_chunks_priv(upload_id: &str, last_chunk_id: u64) -> Result<(), ApiError> {
  let tmp_dir = &CONFIG.get().unwrap().tmp_dir;
  let media_root = &CONFIG.get().unwrap().media_root;
  
  let target_chunks_dir = format!("{tmp_dir}/{upload_id}");
  let target_dir = format!("{media_root}/{upload_id}");
  let target_path = get_storage_path(upload_id).await?;
  create_dir_all(target_dir.as_str()).await?;

  if try_exists(target_path.as_str()).await? {
    remove_file(target_path.as_str()).await?;
  }
    
  let mut file = File::options()
    .create(true)
    .write(true)
    .open(target_path.as_str())
    .await?;

  for chunk_id in 0..=last_chunk_id {
    let data = read(format!("{target_chunks_dir}/chunk_{chunk_id}")).await?;
    file.write_all(data.as_slice()).await?;
    remove_file(format!("{target_chunks_dir}/chunk_{chunk_id}")).await?;
  }
  chunks_cleanup(upload_id).await?;
  Ok(())
}

async fn get_storage_path(upload_id: &str) -> Result<String, ApiError> {
  let mut id = get_music_storage_path(upload_id).await?;
  if id.is_empty() {
    id = get_video_storage_path(upload_id).await?;
  }
  if id.is_empty() {
    id = get_movie_storage_path(upload_id).await?;
  }

  if id.is_empty() {
    Err(ApiError::NotFound)
  } else {
    Ok(id)
  }
}

async fn remove_dir_all_if_exists(path: &str) -> Result<(), ApiError> {
  match remove_dir_all(path).await {
    Ok(_) => Ok(()),
    Err(ref error) if error.kind() == io::ErrorKind::NotFound => Ok(()),
    Err(err) => Err(err.into())
  }
}

async fn chunks_cleanup(upload_id: &str) -> Result<(), ApiError> {
  let tmp_dir = &CONFIG.get().unwrap().tmp_dir;
  let target_chunks_dir = format!("{tmp_dir}/{upload_id}");
  remove_dir_all_if_exists(target_chunks_dir.as_str()).await
}

pub async fn upload_cancel_cleanup(upload_id: &str) -> Result<(), ApiError> {
  let media_root = &CONFIG.get().unwrap().media_root;
  let target_dir = format!("{media_root}/{upload_id}");

  match delete_music_metadata(upload_id).await {
    Ok(_) => {}
    Err(error) => match error {
      ApiError::NotFound => {}
      error => Err(error)?
    }
  }
  match delete_video_metadata(upload_id).await {
    Ok(_) => {}
    Err(error) => match error {
      ApiError::NotFound => {}
      error => Err(error)?
    }
  }
  match delete_movie_metadata(upload_id).await {
    Ok(_) => {}
    Err(error) => match error {
      ApiError::NotFound => {}
      error => Err(error)?
    }
  }

  chunks_cleanup(upload_id).await?;
  remove_dir_all_if_exists(target_dir.as_str()).await?;

  Ok(())
}