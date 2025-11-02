use axum::body::Body;
use axum::extract::Path;
use axum::http;
use axum::response::{IntoResponse, Response};
use crate::auth::jwt::generate_playback_token;
use crate::common::error::ApiError;
use crate::file::conversion::convert_hls;
use crate::file::upload::get_storage_path;

#[derive(serde::Serialize, serde::Deserialize)]
pub struct ModifyUserPath {
  media_id: String,
}
pub async fn serve_media(Path(path): Path<ModifyUserPath>) -> Result<impl IntoResponse, ApiError> {
  let media_path = get_storage_path(path.media_id.as_str()).await?;
  convert_hls(path.media_id.as_str(), media_path.as_str()).await?;

  let response_builder = Response::builder().header(http::header::CONTENT_TYPE, "application/json");
  let response_body = Body::from(serde_json::json!({
    "playback_token": generate_playback_token(path.media_id)?
  }).to_string());
  Ok(response_builder.body(response_body)?)
}