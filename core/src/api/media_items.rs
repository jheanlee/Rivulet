use crate::common::error::ApiError;
use crate::file::tools::remove_dir_all_if_exists;
use crate::orm::media::media::delete_metadata_by_id;
use crate::orm::media::movie::list_movie_metadata;
use crate::orm::media::music::list_music_metadata;
use crate::orm::media::video::list_video_metadata;
use crate::CONFIG;
use axum::extract::Path;
use axum::http;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use sea_orm::ActiveModelTrait;

#[derive(serde::Serialize, serde::Deserialize)]
pub struct ListMediaItemsPath {
  media_type: MediaType
}
#[derive(serde::Serialize, serde::Deserialize)]
#[serde(rename_all="snake_case")]
pub enum MediaType {
  Music,
  Movie,
  Video,
}
pub async fn list_media_items(Path(list_media_path): Path<ListMediaItemsPath>) -> Result<impl IntoResponse, ApiError> {
  let response_body: String;
  match list_media_path.media_type {
    MediaType::Music => {
      response_body = serde_json::to_string(list_music_metadata().await?.as_slice())?;
    }
    MediaType::Movie => {
      response_body = serde_json::to_string(list_movie_metadata().await?.as_slice())?;
    }
    MediaType::Video => {
      response_body = serde_json::to_string(list_video_metadata().await?.as_slice())?;
    }
  }

  let response_builder = Response::builder().header(http::header::CONTENT_TYPE, "application/json");
  Ok(response_builder.body(response_body)?)
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct DeleteMediaItemPath {
  media_id: String,
}
pub async fn delete_media_item(Path(delete_media_item_path): Path<DeleteMediaItemPath>) -> Result<impl IntoResponse, ApiError> {
  let id = delete_media_item_path.media_id.as_str();
  let media_dir = &CONFIG.get().unwrap().media_root;
  let stream_dir = &CONFIG.get().unwrap().stream_root;

  delete_metadata_by_id(delete_media_item_path.media_id.as_str()).await?;
  remove_dir_all_if_exists(format!("{media_dir}/{id}").as_str()).await?;
  remove_dir_all_if_exists(format!("{stream_dir}/{id}").as_str()).await?;
  Ok(StatusCode::OK)
}