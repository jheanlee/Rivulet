use axum::body::Body;
use axum::extract::{Path, Query};
use axum::{http, Json};
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use regex::Regex;
use serde_json::json;
use crate::common::error::ApiError;
use crate::orm::user;

fn check_username_requirements(username: &str) -> bool {
  let regex = Regex::new(r"^[A-Za-z][A-Za-z0-9_-]{3,31}$").unwrap();
  regex.is_match(username)
}

fn check_password_requirements(password: &str) -> bool {
  let regex = Regex::new(r"^[\x21-\x7E]{8,255}$").unwrap();
  regex.is_match(password)
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct CheckUsernameAvailability {
  username: String
}
pub async fn check_username_availability(Json(request_body): Json<CheckUsernameAvailability>) -> Result<Response, ApiError> {
  let response_builder = Response::builder().header(http::header::CONTENT_TYPE, "application/json");
  let response_body = Body::from(
    json!({
      "available": !user::if_username_exists(request_body.username).await?
    }).to_string()
  );
  
  Ok(response_builder.body(response_body)?)
}

pub async fn list_users() -> Result<Response, ApiError> {
  let response_builder = Response::builder().header(http::header::CONTENT_TYPE, "application/json");
  let response_body = Body::from(
    json!({
      "users": user::list_users().await?
    }).to_string()
  );
  Ok(response_builder.body(response_body)?)
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct NewUserRequestBody {
  username: String,
  password: String,
  admin: bool
}
pub async fn new_user(Json(request_body): Json<NewUserRequestBody>) -> Result<impl IntoResponse, ApiError> {
  if check_username_requirements(request_body.username.as_str()) && check_password_requirements(request_body.password.as_str()) {
    if !user::if_username_exists(request_body.username.clone()).await? {
      user::create_user(request_body.username, request_body.password, request_body.admin).await?;
      Ok(StatusCode::CREATED)
    } else {
      Ok(StatusCode::CONFLICT)
    }
  } else {
    Ok(StatusCode::BAD_REQUEST)
  }
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct ModifyUserPath {
  user_id: String,
}
#[derive(serde::Serialize, serde::Deserialize)]
pub struct ModifyUserRequestBody {
  password: String,
  admin: bool
}
pub async fn modify_user(Path(path): Path<ModifyUserPath>, Json(request_body): Json<ModifyUserRequestBody>) -> Result<impl IntoResponse, ApiError> {
  if user::if_user_id_exists(path.user_id.clone()).await? {
    if check_password_requirements(request_body.password.as_str()) {
      user::update_user(path.user_id, request_body.password, request_body.admin).await?;
      Ok(StatusCode::OK)
    } else {
      Ok(StatusCode::BAD_REQUEST)
    }
  } else {
    Ok(StatusCode::NOT_FOUND)
  }
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct DeleteUserPath {
  user_id: String
}
pub async fn delete_user(Path(path): Path<DeleteUserPath>) -> Result<impl IntoResponse, ApiError> {
  user::delete_user(path.user_id).await?;
  Ok(StatusCode::OK)
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct SetAdminPath {
  user_id: String,
}
#[derive(serde::Serialize, serde::Deserialize)]
pub struct SetAdminRequestBody {
  admin: bool,
}
pub async fn set_admin(Path(path): Path<SetAdminPath>, Json(request_body): Json<SetAdminRequestBody>) -> Result<impl IntoResponse, ApiError> {
  user::set_admin(path.user_id, request_body.admin).await?;
  Ok(StatusCode::OK)
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct ResetPasswordPath {
  user_id: String,
}
#[derive(serde::Serialize, serde::Deserialize)]
pub struct ResetPasswordRequestBody {
  old_password: String,
  new_password: String,
}
pub async fn reset_password(Path(path): Path<ResetPasswordPath>, Json(request_body): Json<ResetPasswordRequestBody>) -> Result<impl IntoResponse, ApiError> {
  user::reset_password(path.user_id, request_body.old_password, request_body.new_password).await?;
  Ok(StatusCode::OK)
}