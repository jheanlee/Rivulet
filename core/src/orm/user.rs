use openssl::base64;
use openssl::rand::rand_bytes;
use openssl::sha::Sha256;
use crate::common::error::ApiError;
use crate::SHARED;
use entity::entities::user;
use sea_orm::{ColumnTrait, EntityTrait, ModelTrait, QueryFilter, Set};


fn process_password(password: String, encoded_salt: &[u8]) -> Result<String, ApiError> {
  let mut hasher = Sha256::new();
  hasher.update(encoded_salt);
  hasher.update(password.as_bytes());
  let hashed_password = hasher.finish();
  let encoded_hashed_password = base64::encode_block(&hashed_password);

  Ok(encoded_hashed_password)
}

pub async fn if_user_exists(username: String) -> Result<bool, ApiError> {
  let db_connection = &SHARED.get().unwrap().database_connection;
  Ok(user::Entity::find()
    .filter(user::Column::Username.eq(username))
    .one(db_connection)
    .await?
    .is_some())
}

pub async fn update_user(username: String, password: String, is_administrator: bool) -> Result<(), ApiError> {
  let db_connection = &SHARED.get().unwrap().database_connection;

  let mut salt = [0u8; 8];
  rand_bytes(&mut salt)?;
  let encoded_salt = base64::encode_block(&salt);

  let encoded_password = process_password(password, encoded_salt.as_bytes())?;

  let user = user::ActiveModel{
    id: Default::default(),
    username: Set(username),
    hashed_password: Set(encoded_password),
    salt: Set(encoded_salt),
    administrator: Set(is_administrator),
  };

  user::Entity::insert(user).on_conflict(
    sea_orm::sea_query::OnConflict::column(user::Column::Username)
      .update_column(user::Column::HashedPassword)
      .update_column(user::Column::Salt)
      .to_owned()
  ).exec(db_connection).await?;

  Ok(())
}

pub async fn remove_user(username: String) -> Result<u64, ApiError> {
  let db_connection = &SHARED.get().unwrap().database_connection;
  let user = user::Entity::find()
    .filter(user::Column::Username.eq(username))
    .one(db_connection)
    .await?;

  if let Some(user) = user {
    Ok(user.delete(db_connection).await?.rows_affected)
  } else {
    Ok(0)
  }
}

pub async fn authenticate_user(username: String, password: String) -> Result<Option<bool>, ApiError> {
  let db_connection = &SHARED.get().unwrap().database_connection;
  let user = user::Entity::find()
    .filter(user::Column::Username.eq(username))
    .one(db_connection)
    .await?;

  if let Some(user) = user {
    Ok(Some(process_password(password, user.salt.as_bytes())? == user.hashed_password))
  } else {
    Ok(None)
  }
}

pub async fn is_admin(username: String) -> Result<Option<bool>, ApiError> {
  let db_connection = &SHARED.get().unwrap().database_connection;
  let user = user::Entity::find()
    .filter(user::Column::Username.eq(username))
    .one(db_connection)
    .await?;

  if let Some(user) = user {
    Ok(Some(user.administrator))
  } else {
    Ok(None)
  }
}

pub async fn list_users() -> Result<Vec<user::Model>, ApiError> {
  let db_connection = &SHARED.get().unwrap().database_connection;
  Ok(user::Entity::find().all(db_connection).await?)
}