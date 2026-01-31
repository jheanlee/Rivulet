use axum::extract::{Path, Query};
use axum::http;
use axum::response::{IntoResponse, Response};
use crate::common::error::ApiError;
use crate::orm::movie::list_movie_metadata;
use crate::orm::music::list_music_metadata;
use crate::orm::video::list_video_metadata;

#[derive(serde::Serialize, serde::Deserialize)]
pub struct ListMediaPath {
  media_type: MediaType
}
#[derive(serde::Serialize, serde::Deserialize)]
#[serde(rename_all="snake_case")]
pub enum MediaType {
  Music,
  Movie,
  Video,
}
pub async fn list_media(Path(list_media_query): Path<ListMediaPath>) -> Result<impl IntoResponse, ApiError> {
  let response_body: String;
  match list_media_query.media_type {
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