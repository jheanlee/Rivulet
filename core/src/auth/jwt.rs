use crate::SHARED;
use jsonwebtoken::{get_current_timestamp, Algorithm, Header};
use crate::common::error::ApiError;

#[derive(serde::Serialize, serde::Deserialize, Debug)]
pub struct Claims {
  pub sub: String,
  pub exp: u64,
  pub iat: u64,
}

pub async fn generate_refresh_token(sub: String) -> Result<String, ApiError> {
  let claims = Claims {
    sub: sub,
    iat: get_current_timestamp(),
    exp: get_current_timestamp() + 86400,
  };
  let token = jsonwebtoken::encode(&Header::new(Algorithm::RS256), &claims, &SHARED.get().unwrap().jwt_keys_refresh.encoding_key)?;
  Ok(token)
}

pub async fn generate_access_token(sub: String) -> Result<String, ApiError> {
  let claims = Claims {
    sub: sub,
    iat: get_current_timestamp(),
    exp: get_current_timestamp() + 600,
  };
  let token = jsonwebtoken::encode(&Header::new(Algorithm::RS256), &claims, &SHARED.get().unwrap().jwt_keys_access.encoding_key)?;
  Ok(token)
}
