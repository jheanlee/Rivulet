use sea_orm::{ActiveModelTrait, IntoActiveModel};
use entity::entities::{movie, music, video};
use crate::common::error::ApiError;
use crate::orm::media::media::MetadataModels::{MovieModel, MusicModel, VideoModel};
use crate::orm::media::movie::find_movie_metadata;
use crate::orm::media::music::find_music_metadata;
use crate::orm::media::video::find_video_metadata;
use crate::SHARED;

pub enum MetadataModels{
  MusicModel(music::Model),
  VideoModel(video::Model),
  MovieModel(movie::Model)
}
pub async fn get_metadata_by_id(id: &str) -> Result<MetadataModels, ApiError> {
  if let Some(music_model) = find_music_metadata(id).await? {
    Ok(MusicModel(music_model))
  } else if let Some(video_model) = find_video_metadata(id).await? {
    Ok(VideoModel(video_model))
  } else if let Some(movie_model) = find_movie_metadata(id).await? {
    Ok(MovieModel(movie_model))
  } else {
    Err(ApiError::NotFound)
  }
}

pub async fn delete_metadata_by_id(id: &str) -> Result<(), ApiError> {
  let db_connection = &SHARED.get().unwrap().database_connection;
  let model = get_metadata_by_id(id).await?;

  match model {
    MusicModel(model) => {
      model.into_active_model().delete(db_connection).await?;
    }
    VideoModel(model) => {
      model.into_active_model().delete(db_connection).await?;
    }
    MovieModel(model) => {
      model.into_active_model().delete(db_connection).await?;
    }
  }

  Ok(())
}