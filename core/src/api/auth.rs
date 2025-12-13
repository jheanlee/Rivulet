use axum::body::Body;
use axum::http::{HeaderMap, StatusCode};
use axum::{http, Json};
use axum::extract::Request;
use axum::middleware::Next;
use axum::response::{IntoResponse, Response};
use jsonwebtoken::{get_current_timestamp, Algorithm, Validation};
use crate::auth::jwt::{generate_access_token, generate_refresh_token, Claims, PlaybackClaims};
use crate::common::error::ApiError;
use crate::orm::user::{authenticate_user, if_user_id_exists, is_admin};
use crate::SHARED;

pub async fn verify_playback_token(header_map: HeaderMap, request: Request, next: Next) -> Result<Response, StatusCode> {
  if let Some(token) = header_map.get("authorization") {
    let mut validation = Validation::new(Algorithm::RS256);
    validation.set_required_spec_claims(&["exp"]);

    match jsonwebtoken::decode::<PlaybackClaims>(token.to_str().unwrap_or_else(|_| {""}), &SHARED.get().unwrap().jwt_keys_access.decoding_key, &validation) {
      Ok(token_data) => {
        let path: Vec<&str> = request.uri().path().split('/').collect();
        if path.starts_with(&["api", "media", "stream"]) && path.len() >= 5 && Some(&token_data.claims.media_id.as_str()) == path.get(3) {
          let response = next.run(request).await;
          Ok(response)
        } else {
          Err(StatusCode::FORBIDDEN)
        }
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
      Ok(_token_data) => {
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
          Ok(is_admin) if !is_admin => {
            Err(StatusCode::FORBIDDEN)
          },
          Err(error) => {
            Err(error.into_response().status())
          },
          _ => {
            let response = next.run(request).await;
            Ok(response)
          }
        }
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
  match authenticate_user(authentication.username.clone(), authentication.password).await {
    Ok(user_id) => {
      let response_builder = Response::builder().header(http::header::CONTENT_TYPE, "application/json");
      let response_body = Body::from(serde_json::json!({
      "refresh_token": generate_refresh_token(user_id.clone())?,
      "access_token": generate_access_token(user_id)?
      }).to_string());
      Ok(response_builder.body(response_body)?)
    }
    Err(error) => {
      match error {
        ApiError::Error(_) => Err(error),
        _ => Err(ApiError::Unauthorized)
      }
    }
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

  let refresh_token_data: Result<jsonwebtoken::TokenData<Claims>, jsonwebtoken::errors::Error> =
    jsonwebtoken::decode(tokens.refresh_token.as_str(), &SHARED.get().unwrap().jwt_keys_refresh.decoding_key, &validation_refresh);

  if let Ok(refresh_token_data) = refresh_token_data {
    let mut validation_access = Validation::new(Algorithm::RS256);
    validation_access.set_required_spec_claims(&["sub", "iat"]);
    validation_access.validate_exp = false;

    let access_token_data: Result<jsonwebtoken::TokenData<Claims>, jsonwebtoken::errors::Error> =
      jsonwebtoken::decode(tokens.access_token.as_str(), &SHARED.get().unwrap().jwt_keys_access.decoding_key, &validation_access);

    if let Ok(access_token_data) = access_token_data {
      if if_user_id_exists(access_token_data.claims.sub).await? && access_token_data.claims.exp + 30 * 24 * 60 * 60 >= get_current_timestamp() {
        let new_access_token = generate_access_token(refresh_token_data.claims.sub);

        let response_builder = Response::builder().header(http::header::CONTENT_TYPE, "application/json");
        let response_body = Body::from(serde_json::json!({
          "access_token" :new_access_token?
        }).to_string());
        
        let response = response_builder.body(response_body)?;
        Ok(response)
      } else {
        Err(ApiError::Unauthorized)
      }
    } else {
      Err(ApiError::Unauthorized)
    }
  } else {
    Err(ApiError::Unauthorized)
  }
}