use crate::SHARED;
use jsonwebtoken::{get_current_timestamp, Algorithm, Header};
use crate::common::error::ApiError;

#[derive(serde::Serialize, serde::Deserialize, Debug)]
pub struct Claims {
  pub sub: String,
  pub exp: u64,
  pub iat: u64,
}

pub fn generate_refresh_token(sub: String) -> Result<String, ApiError> {
  let claims = Claims {
    sub: sub,
    iat: get_current_timestamp(),
    exp: get_current_timestamp() + 30 * 24 * 60 * 60,
  };
  let token = jsonwebtoken::encode(&Header::new(Algorithm::RS256), &claims, &SHARED.get().unwrap().jwt_keys_refresh.encoding_key)?;
  Ok(token)
}

pub fn generate_access_token(sub: String) -> Result<String, ApiError> {
  let claims = Claims {
    sub: sub,
    iat: get_current_timestamp(),
    exp: get_current_timestamp() + 600,
  };
  let token = jsonwebtoken::encode(&Header::new(Algorithm::RS256), &claims, &SHARED.get().unwrap().jwt_keys_access.encoding_key)?;
  Ok(token)
}

#[derive(serde::Serialize, serde::Deserialize, Debug)]
pub struct PlaybackClaims {
  pub exp: u64,
  pub media_id: String
}
pub fn generate_playback_token(media_id: String) -> Result<String, ApiError> {
  let claims = PlaybackClaims {
    exp: get_current_timestamp() + 6 * 60 * 60,
    media_id: media_id
  };
  let token = jsonwebtoken::encode(&Header::new(Algorithm::RS256), &claims, &SHARED.get().unwrap().jwt_keys_access.encoding_key)?;
  Ok(token)
}

