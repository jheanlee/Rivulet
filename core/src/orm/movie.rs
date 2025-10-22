use chrono::NaiveDate;
use nanoid::nanoid;
use sea_orm::{ActiveModelTrait, EntityTrait, IntoActiveModel, Set};
use entity::entities::movie;
use entity::entities::movie::{ActiveModel, Entity};
use crate::api::models::upload::UploadMetadataMovie;
use crate::common::error::ApiError;
use crate::{CONFIG, SHARED};

pub async fn new_movie_metadata(metadata: UploadMetadataMovie) -> Result<String, ApiError> {
  let media_root = &CONFIG.get().unwrap().media_root;
  let db_connection = &SHARED.get().unwrap().database_connection;
  let id = nanoid!();
  
  let movie = ActiveModel {
    id: Set(id.clone()),
    title: Set(metadata.title),
    director: Set(metadata.director),
    cast: Set(metadata.cast),
    genres: Set(metadata.genres),
    language: Set(metadata.language),
    region: Set(metadata.region),
    release_date: Set(
      if let Some(release_date) = metadata.release_date {
        Some(NaiveDate::parse_from_str(release_date.as_str(), "%+").map_err(|_| ApiError::BadRequest)?)
      } else { None }
    ),
    year: Set(metadata.year),
    date_added: Set(chrono::Utc::now().naive_utc().date()),
    description: Set(metadata.description),
    storage_path: Set(format!("{media_root}/{id}/media.{}", metadata.file_ext)),
  };
  
  let _res = Entity::insert(movie).on_conflict(
    sea_orm::sea_query::OnConflict::column(movie::Column::Id)
      .do_nothing()
      .to_owned()
  ).exec(db_connection).await?;
  
  Ok(id)
}

pub async fn delete_movie_metadata(id: &str) -> Result<u64, ApiError> {
  let db_connection = &SHARED.get().unwrap().database_connection;
  if let Some(model) = Entity::find_by_id(id).one(db_connection).await? {
    Ok(model.into_active_model().delete(db_connection).await?.rows_affected)
  } else {
    Err(ApiError::NotFound)
  }
}

pub async fn get_movie_storage_path(id: &str) -> Result<String, ApiError> {
  let db_connection = &SHARED.get().unwrap().database_connection;
  if let Some(model) = Entity::find_by_id(id).one(db_connection).await? {
    Ok(model.storage_path)
  } else {
    Ok(String::new())
  }
}