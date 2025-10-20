use nanoid::nanoid;
use sea_orm::{EntityTrait, Set};
use entity::entities::video;
use entity::entities::video::ActiveModel;
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
    storage_path: Set(format!("{media_root}/{id}/tmp_file")),  //  TODO
  };
  
  let _res = video::Entity::insert(video).on_conflict(
    sea_orm::sea_query::OnConflict::column(video::Column::Id)
      .do_nothing()
      .to_owned()
  ).exec(db_connection).await?;
  
  Ok(id)
}