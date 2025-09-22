use axum::http::StatusCode;
use axum::response::Response;
use crate::common::log::Level::Warning;
use crate::common::log::log;

#[derive(Debug)]
pub enum ApiError {
  Error(anyhow::Error),
  NotFound,
  Unauthorized,
  Conflict,
}

impl axum::response::IntoResponse for ApiError {
  fn into_response(self) -> Response {
    match self {
      ApiError::Error(e) => {
        log(Warning, format!("api error {e}").as_str(), "api");
        StatusCode::INTERNAL_SERVER_ERROR.into_response()
      },
      ApiError::NotFound => {
        StatusCode::NOT_FOUND.into_response()
      },
      ApiError::Unauthorized => {
        StatusCode::UNAUTHORIZED.into_response()
      }
      ApiError::Conflict => {
        StatusCode::CONFLICT.into_response()
      }
    }
  }
}

impl<E> From<E> for ApiError where E: Into<anyhow::Error> {
  fn from(error: E) -> Self {
    Self::Error(error.into())
  }
}
