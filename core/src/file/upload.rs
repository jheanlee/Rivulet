use tokio::fs::{create_dir_all, read, remove_dir, remove_file, try_exists, write, File};
use tokio::io::AsyncWriteExt;
use crate::common::error::ApiError;
use crate::CONFIG;

pub async fn write_chunk(upload_id: &str, chunk_id: u64, data: &[u8]) -> Result<(), ApiError> {
  let tmp_dir = &CONFIG.get().unwrap().tmp_dir;
  create_dir_all(format!("{tmp_dir}/{upload_id}")).await?;
  write(format!("{tmp_dir}/{upload_id}/chunk_{chunk_id}"), data).await?;
  Ok(())
}

pub async fn assemble_chunks(upload_id: &str, last_chunk_id: u64) -> Result<(), ApiError> {
  let tmp_dir = &CONFIG.get().unwrap().tmp_dir;
  let media_root = &CONFIG.get().unwrap().media_root;
  
  let target_chunks_dir = format!("{tmp_dir}/{upload_id}");
  let target_dir = format!("{media_root}/{upload_id}");
  let target_path = format!("{target_dir}/tmp_file");  //  TODO: file rename

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
  remove_dir(target_chunks_dir).await?;
  Ok(())
}

//  TODO chunk clean up