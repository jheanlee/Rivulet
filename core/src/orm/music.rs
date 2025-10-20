use chrono::NaiveDate;
use nanoid::nanoid;
use sea_orm::{EntityTrait, Set};
use entity::entities::music;
use entity::entities::music::ActiveModel;
use crate::api::models::upload::UploadMetadataMusic;
use crate::common::error::ApiError;
use crate::{CONFIG, SHARED};

pub async fn new_music_metadata(metadata: UploadMetadataMusic) -> Result<String, ApiError> {
  let media_root = &CONFIG.get().unwrap().media_root;
  let db_connection = &SHARED.get().unwrap().database_connection;
  let id = nanoid!();


  let music = ActiveModel {
    id: Set(id.clone()),
    title: Set(metadata.title),
    artists: Set(metadata.artists),
    genres: Set(metadata.genres),
    language: Set(metadata.language),
    region: Set(metadata.region),
    album: Set(metadata.album),
    disk_number: Set(metadata.disk_number),
    track_number: Set(metadata.track_number),
    release_date: Set(
      if let Some(release_date) = metadata.release_date {
        Some(NaiveDate::parse_from_str(release_date.as_str(), "%+").map_err(|_| ApiError::BadRequest)?)
      } else { None }
    ),
    year: Set(metadata.year),
    date_added: Set(chrono::Utc::now().naive_utc().date()),
    description: Set(metadata.description),
    storage_path: Set(format!("{media_root}/{id}/tmp_file")),  //  TODO
    video_id: Set(metadata.video_id),
  };
  
  let _res = music::Entity::insert(music).on_conflict(
    sea_orm::sea_query::OnConflict::column(music::Column::Id)
      .do_nothing()
      .to_owned()
  ).exec(db_connection).await?;

  Ok(id)
}