use axum::body::Body;
use axum::extract::Query;
use axum::http;
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
pub struct CheckUserAvailability {
  username: String
}
pub async fn check_user_availability(Query(query): Query<CheckUserAvailability>) -> Result<Response, ApiError> {
  let response_builder = Response::builder().header(http::header::CONTENT_TYPE, "application/json");
  let response_body = Body::from(
    json!({
      "available": !user::if_user_exists(query.username).await?
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
pub struct SetAdmin {
  username: String,
  admin: bool,
}
pub async fn set_admin(Query(query): Query<SetAdmin>) -> Result<impl IntoResponse, ApiError> {
  user::set_admin(query.username, query.admin).await?;
  Ok(StatusCode::OK)
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct NewUser {
  username: String,
  password: String,
  admin: bool
}
pub async fn new_user(Query(query): Query<NewUser>) -> Result<impl IntoResponse, ApiError> {
  if check_username_requirements(query.username.as_str()) && check_password_requirements(query.password.as_str()) {
    if !user::if_user_exists(query.username.clone()).await? {
      user::update_user(query.username, query.password, query.admin).await?;
      Ok(StatusCode::OK)
    } else {
      Ok(StatusCode::CONFLICT)
    }
  } else {
    Ok(StatusCode::BAD_REQUEST)
  }
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct ModifyUser {
  username: String,
  password: String,
  admin: bool
}
pub async fn modify_user(Query(query): Query<ModifyUser>) -> Result<impl IntoResponse, ApiError> {
  if check_password_requirements(query.password.as_str()) {
    if user::if_user_exists(query.username.clone()).await? {
      user::update_user(query.username, query.password, query.admin).await?;
      Ok(StatusCode::OK)
    } else {
      Ok(StatusCode::NOT_FOUND)
    }
  } else {
    Ok(StatusCode::BAD_REQUEST)
  }
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct DeleteUser {
  username: String
}
pub async fn delete_user(Query(query): Query<DeleteUser>) -> Result<impl IntoResponse, ApiError> {
  if user::if_user_exists(query.username.clone()).await? {
    user::delete_user(query.username).await?;
    Ok(StatusCode::OK)
  } else {
    Ok(StatusCode::NOT_FOUND)
  }
}