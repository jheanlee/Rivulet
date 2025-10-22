use nanoid::nanoid;
use sea_orm::{ActiveModelTrait, EntityTrait, IntoActiveModel, Set};
use entity::entities::video;
use entity::entities::video::{ActiveModel, Entity};
use crate::api::models::upload::UploadMetadataVideo;
use crate::common::error::ApiError;
use crate::{CONFIG, SHARED};

pub async fn new_video_metadata(metadata: UploadMetadataVideo) -> Result<String, ApiError> {
  let media_root = &CONFIG.get().unwrap().media_root;
  let db_connection = &SHARED.get().unwrap().database_connection;
  let id = nanoid!();
  
  let video = ActiveModel {
    id: Set(id.clone()),
    title: Set(metadata.title),
    creator: Set(metadata.creator),
    categories: Set(metadata.categories),
    language: Set(metadata.language),
    region: Set(metadata.region),
    date_added: Set(chrono::Utc::now().naive_utc().date()),
    description: Set(metadata.description),
    storage_path: Set(format!("{media_root}/{id}/media.{}", metadata.file_ext)),
  };
  
  let _res = video::Entity::insert(video).on_conflict(
    sea_orm::sea_query::OnConflict::column(video::Column::Id)
      .do_nothing()
      .to_owned()
  ).exec(db_connection).await?;
  
  Ok(id)
}

pub async fn delete_video_metadata(id: &str) -> Result<u64, ApiError> {
  let db_connection = &SHARED.get().unwrap().database_connection;
  if let Some(model) = Entity::find_by_id(id).one(db_connection).await? {
    Ok(model.into_active_model().delete(db_connection).await?.rows_affected)
  } else {
    Err(ApiError::NotFound)
  }
}

pub async fn get_video_storage_path(id: &str) -> Result<String, ApiError> {
  let db_connection = &SHARED.get().unwrap().database_connection;
  if let Some(model) = Entity::find_by_id(id).one(db_connection).await? {
    Ok(model.storage_path)
  } else {
    Ok(String::new())
  }
}