use nanoid::nanoid;
use openssl::base64;
use openssl::rand::rand_bytes;
use openssl::sha::Sha256;
use crate::common::error::ApiError;
use crate::SHARED;
use entity::entities::user;
use sea_orm::{ActiveModelTrait, ColumnTrait, DbErr, EntityTrait, IntoActiveModel, ModelTrait, QueryFilter, Set};


fn process_password(password: String, encoded_salt: &[u8]) -> Result<String, ApiError> {
  let mut hasher = Sha256::new();
  hasher.update(encoded_salt);
  hasher.update(password.as_bytes());
  let hashed_password = hasher.finish();
  let encoded_hashed_password = base64::encode_block(&hashed_password);

  Ok(encoded_hashed_password)
}

pub async fn if_user_id_exists(user_id: String) -> Result<bool, ApiError> {
  let db_connection = &SHARED.get().unwrap().database_connection;
  Ok(user::Entity::find_by_id(user_id)
    .one(db_connection)
    .await?
    .is_some())
}

pub async fn if_username_exists(username: String) -> Result<bool, ApiError> {
  let db_connection = &SHARED.get().unwrap().database_connection;
  Ok(user::Entity::find()
    .filter(user::Column::Username.eq(username))
    .one(db_connection)
    .await?
    .is_some())
}

pub async fn list_users() -> Result<Vec<user::PartialModel>, ApiError> {
  let db_connection = &SHARED.get().unwrap().database_connection;
  Ok(user::Entity::find().into_partial_model().all(db_connection).await?)
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

pub async fn set_admin(user_id: String, is_administrator: bool) -> Result<(), ApiError> {
  let db_connection = &SHARED.get().unwrap().database_connection;
  let mut user = user::Entity::find_by_id(user_id)
    .one(db_connection)
    .await?
    .ok_or(ApiError::NotFound)?
    .into_active_model();
  user.administrator = Set(is_administrator);
  user.update(db_connection).await?;
  Ok(())
}

pub async fn reset_password(user_id: String, old_password: String, new_password: String) -> Result<(), ApiError> {
  let db_connection = &SHARED.get().unwrap().database_connection;
  let user = user::Entity::find_by_id(user_id)
    .one(db_connection)
    .await?
    .ok_or(ApiError::NotFound)?;

  if process_password(old_password, user.salt.as_bytes())? == user.hashed_password {
    let mut user = user.into_active_model();

    let mut salt = [0u8; 8];
    rand_bytes(&mut salt)?;
    let encoded_salt = base64::encode_block(&salt);
    user.hashed_password = Set(process_password(new_password, encoded_salt.as_bytes())?);
    user.salt = Set(encoded_salt);
    user.update(db_connection).await?;
    Ok(())
  } else {
    Err(ApiError::Unauthorized)
  }
}

pub async fn create_user(username: String, password: String, is_administrator: bool) -> Result<(), ApiError> {
  let db_connection = &SHARED.get().unwrap().database_connection;

  let mut salt = [0u8; 8];
  rand_bytes(&mut salt)?;
  let encoded_salt = base64::encode_block(&salt);

  let encoded_password = process_password(password, encoded_salt.as_bytes())?;

  let user = user::ActiveModel{
    id: Set(nanoid!()),
    username: Set(username),
    hashed_password: Set(encoded_password),
    salt: Set(encoded_salt),
    administrator: Set(is_administrator),
  };

  let res = user::Entity::insert(user).on_conflict(
    sea_orm::sea_query::OnConflict::column(user::Column::Username)
      .do_nothing()
      .to_owned()
  ).exec(db_connection).await;

  match res {
    Ok(_) => Ok(()),
    Err(err) => match err  {
      DbErr::RecordNotInserted => Err(ApiError::Conflict),
      _ => Err(err.into())
    }
  }
}

pub async fn update_user(user_id: String, password: String, is_administrator: bool) -> Result<(), ApiError> {
  let db_connection = &SHARED.get().unwrap().database_connection;

  let mut user = user::Entity::find_by_id(user_id)
    .one(db_connection)
    .await?
    .ok_or(ApiError::NotFound)?
    .into_active_model();

  let mut salt = [0u8; 8];
  rand_bytes(&mut salt)?;
  let encoded_salt = base64::encode_block(&salt);

  let encoded_password = process_password(password, encoded_salt.as_bytes())?;

  user.salt = Set(encoded_salt);
  user.hashed_password = Set(encoded_password);
  user.administrator = Set(is_administrator);

  user.update(db_connection).await?;

  Ok(())
}

pub async fn delete_user(user_id: String) -> Result<u64, ApiError> {
  let db_connection = &SHARED.get().unwrap().database_connection;
  let user = user::Entity::find_by_id(user_id)
    .one(db_connection)
    .await?;

  if let Some(user) = user {
    let res = user.delete(db_connection).await?.rows_affected;
    if res > 0 { Ok(res) } else { Err(ApiError::NotFound) }
  } else {
    Err(ApiError::NotFound)
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