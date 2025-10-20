use std::str::FromStr;
use axum::body::{Body, Bytes};
use axum::extract::{Multipart, Query};
use axum::http;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use serde_json::json;
use crate::api::models::upload::{UploadMetadataMovie, UploadMetadataMusic, UploadMetadataVideo};
use crate::common::error::ApiError;
use crate::file::upload::{assemble_chunks, write_chunk};
use crate::orm::movie::new_movie_metadata;
use crate::orm::music::new_music_metadata;
use crate::orm::video::new_video_metadata;

pub async fn upload_file(mut multipart: Multipart) -> Result<impl IntoResponse, ApiError> {
  let mut upload_id: Option<String> = None;
  let mut chunk_id: Option<u64> = None;
  let mut data: Option<Bytes> = None;
  let mut end_of_file: Option<bool> = None;

  while let Some(field) = multipart.next_field().await? {
    if let Some(name) = field.name() {
      match name {
        "upload_id" => {
          upload_id = Some(String::from_utf8(field.bytes().await?.to_vec()).map_err(|_| ApiError::BadRequest)?);
        },
        "chunk_id" => {
          chunk_id = Some(
            str::from_utf8(
              field.bytes().await?.to_vec().as_slice())
              .map_err(|_| ApiError::BadRequest)?
              .parse()
              .map_err(|_| ApiError::BadRequest)?
          );
        },
        "data" => {
          data = Some(field.bytes().await?)
        },
        "end_of_file" => {
          end_of_file = Some(
            bool::from_str(
              str::from_utf8(field.bytes().await?.to_vec().as_slice())
                .map_err(|_| ApiError::BadRequest)?
            ).map_err(|_| ApiError::BadRequest)?
          );
        },
        _ => {}
      }
    }
  }

  if let (Some(upload_id), Some(chunk_id), Some(data), Some(end_of_file)) = (upload_id, chunk_id, data, end_of_file) {
    write_chunk(upload_id.as_str(), chunk_id, data.as_ref()).await?;
    if end_of_file {
      assemble_chunks(upload_id.as_str(), chunk_id).await?;
    }
    Ok(StatusCode::OK)
  } else {
    Err(ApiError::BadRequest)
  }
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct UploadMetadataQuery {
  media_type: UploadType
}

#[derive(serde::Serialize, serde::Deserialize)]
#[serde(rename_all="lowercase")]
pub enum UploadType {
  Music,
  Movie,
  Video,
}

pub async fn upload_metadata(Query(upload_metadata_params): Query<UploadMetadataQuery>, body: String) -> Result<impl IntoResponse, ApiError> {
  match upload_metadata_params.media_type {
    UploadType::Music => {
      let metadata: UploadMetadataMusic = serde_json::from_str(body.as_str()).map_err(|_| ApiError::BadRequest)?;
      let id = new_music_metadata(metadata).await?;

      let response_builder = Response::builder().header(http::header::CONTENT_TYPE, "application/json");
      let response_body = Body::from(json!({
        "id": id
      }).to_string());
      Ok(response_builder.body(response_body)?)
    },
    UploadType::Movie => {
      let metadata: UploadMetadataMovie = serde_json::from_str(body.as_str()).map_err(|_| ApiError::BadRequest)?;
      let id = new_movie_metadata(metadata).await?;

      let response_builder = Response::builder().header(http::header::CONTENT_TYPE, "application/json");
      let response_body = Body::from(json!({
        "id": id
      }).to_string());
      Ok(response_builder.body(response_body)?)
    },
    UploadType::Video => {
      let metadata: UploadMetadataVideo = serde_json::from_str(body.as_str()).map_err(|_| ApiError::BadRequest)?;
      let id = new_video_metadata(metadata).await?;

      let response_builder = Response::builder().header(http::header::CONTENT_TYPE, "application/json");
      let response_body = Body::from(json!({
        "id": id
      }).to_string());
      Ok(response_builder.body(response_body)?)
    }
  }
}
