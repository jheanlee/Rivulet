use axum::body::Body;
use axum::http::{HeaderMap, StatusCode};
use axum::{http, Json};
use axum::extract::Request;
use axum::middleware::Next;
use axum::response::{IntoResponse, Response};
use jsonwebtoken::{get_current_timestamp, Algorithm, Validation};
use crate::auth::jwt::{generate_access_token, generate_refresh_token, Claims, PlaybackClaims};
use crate::common::error::ApiError;
use crate::orm::user::{authenticate_user, is_admin};
use crate::SHARED;

pub async fn verify_playback_token(header_map: HeaderMap, request: Request, next: Next) -> Result<Response, StatusCode> {
  if let Some(token) = header_map.get("authorization") {
    let mut validation = Validation::new(Algorithm::RS256);
    validation.set_required_spec_claims(&["exp"]);

    match jsonwebtoken::decode::<PlaybackClaims>(token.to_str().unwrap_or_else(|_| {""}), &SHARED.get().unwrap().jwt_keys_access.decoding_key, &validation) {
      Ok(_) => {
        let response = next.run(request).await;
        Ok(response)
      },
      Err(_) => Err(StatusCode::UNAUTHORIZED)
    }
  } else {
    Err(StatusCode::UNAUTHORIZED)
  }
}

//  json web token verification layer
pub async fn verify_jwt(header_map: HeaderMap, request: Request, next: Next) -> Result<Response, StatusCode> {
  if let Some(token) = header_map.get("authorization") {
    let mut validation = Validation::new(Algorithm::RS256);
    validation.set_required_spec_claims(&["sub", "iat", "exp"]);

    match jsonwebtoken::decode::<Claims>(token.to_str().unwrap_or_else(|_| {""}), &SHARED.get().unwrap().jwt_keys_access.decoding_key, &validation) {
      Ok(token_data) => {
        //  TODO
        let response = next.run(request).await;
        Ok(response)
      },
      Err(_) => Err(StatusCode::UNAUTHORIZED)
    }
  } else {
    Err(StatusCode::UNAUTHORIZED)
  }
}

//  admin access authorisation layer
pub async fn verify_admin(header_map: HeaderMap, request: Request, next: Next) -> Result<Response, StatusCode> {
  if let Some(token) = header_map.get("authorization") {
    let mut validation = Validation::new(Algorithm::RS256);
    validation.set_required_spec_claims(&["sub", "iat", "exp"]);

    match jsonwebtoken::decode::<Claims>(token.to_str().unwrap_or_else(|_| {""}), &SHARED.get().unwrap().jwt_keys_access.decoding_key, &validation) {
      Ok(data) => {
        match is_admin(data.claims.sub).await {
          Ok(is_admin) if is_admin.is_none() => Err(StatusCode::UNAUTHORIZED)?,
          Ok(is_admin) if !is_admin.unwrap() => Err(StatusCode::FORBIDDEN)?,
          Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR)?,
          _ => {}
        }
        let response = next.run(request).await;
        Ok(response)
      },
      Err(_) => Err(StatusCode::UNAUTHORIZED)
    }
  } else {
    Err(StatusCode::UNAUTHORIZED)
  }
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct UserAuthentication {
  username: String,
  password: String
}

pub async fn login(Json(authentication): Json<UserAuthentication>) -> Result<Response, ApiError> {
  let res = authenticate_user(authentication.username.clone(), authentication.password).await?;
  if res.is_none() || !res.unwrap() {
    Ok(StatusCode::UNAUTHORIZED.into_response())
  } else {
    let response_builder = Response::builder().header(http::header::CONTENT_TYPE, "application/json");
    let response_body = Body::from(serde_json::json!({
      "refresh_token": generate_refresh_token(authentication.username.clone())?,
      "access_token": generate_access_token(authentication.username)?
    }).to_string());
    Ok(response_builder.body(response_body)?)
  }
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct Tokens {
  refresh_token: String,
  access_token: String
}

pub async fn refresh_token(Json(tokens): Json<Tokens>) -> Result<Response, ApiError> {
  let mut validation_refresh = Validation::new(Algorithm::RS256);
  validation_refresh.set_required_spec_claims(&["sub", "iat", "exp"]);

  let refresh_token_data: Result<jsonwebtoken::TokenData<crate::auth::jwt::Claims>, jsonwebtoken::errors::Error> =
    jsonwebtoken::decode(tokens.refresh_token.as_str(), &SHARED.get().unwrap().jwt_keys_refresh.decoding_key, &validation_refresh);

  if let Ok(refresh_token_data) = refresh_token_data {
    let mut validation_access = Validation::new(Algorithm::RS256);
    validation_access.set_required_spec_claims(&["sub", "iat"]);
    validation_access.validate_exp = false;

    let access_token_data: Result<jsonwebtoken::TokenData<crate::auth::jwt::Claims>, jsonwebtoken::errors::Error> =
      jsonwebtoken::decode(tokens.access_token.as_str(), &SHARED.get().unwrap().jwt_keys_access.decoding_key, &validation_access);

    if let Ok(access_token_data) = access_token_data {
      if access_token_data.claims.exp + 24 * 60 * 60 >= get_current_timestamp() {
        let new_access_token = generate_access_token(refresh_token_data.claims.sub);

        let response_builder = Response::builder().header(http::header::CONTENT_TYPE, "application/json");
        let response_body = Body::from(serde_json::json!({
          "access_token" :new_access_token?
        }).to_string());
        let response = response_builder.body(response_body)?;
        Ok(response)
      } else {
        Ok(StatusCode::UNAUTHORIZED.into_response())
      }
    } else {
      Ok(StatusCode::UNAUTHORIZED.into_response())
    }
  } else {
    Ok(StatusCode::UNAUTHORIZED.into_response())
  }
}