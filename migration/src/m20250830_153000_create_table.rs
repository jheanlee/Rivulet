use sea_orm_migration::{prelude::*, schema::*};
use crate::ColumnType::Text;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(User::Table)
          .if_not_exists()
          .col(string_len_uniq(User::Id, 21).primary_key()) //  nanoid
          .col(text_uniq(User::Username))
          .col(text(User::HashedPassword))
          .col(text(User::Salt))
          .col(boolean(User::Administrator))
          .to_owned()
      ).await?;
    manager
      .create_table(
        Table::create()
          .table(Music::Table)
          .if_not_exists()
          .col(string_len_uniq(Music::Id, 21).primary_key())  //  nanoid
          .col(text(Music::Title))
          .col(array(Music::Artists, Text))
          .col(array(Music::Genres, Text))
          .col(text(Music::Language))
          .col(text(Music::Region))
          .col(text(Music::Album))
          .col(integer(Music::DiskNumber))
          .col(integer(Music::TrackNumber))
          .col(date(Music::ReleaseDate))
          .col(integer(Music::Year))
          .col(date(Music::DateAdded))
          .col(text(Music::Description))
          .col(text(Music::StoragePath))
          .col(text(Music::VideoId))
          .to_owned(),
      )
      .await?;
    manager
      .create_table(
        Table::create()
          .table(MusicPlaylist::Table)
          .if_not_exists()
          .col(string_len_uniq(MusicPlaylist::Id, 21).primary_key())  //  nanoid
          .col(text(MusicPlaylist::Title))
          .col(array(MusicPlaylist::Artists, Text))
          .col(array(MusicPlaylist::Genres, Text))
          .col(date(MusicPlaylist::ReleaseDate))
          .col(integer(MusicPlaylist::Year))
          .col(date(MusicPlaylist::DateAdded))
          .col(array(MusicPlaylist::MusicIds, Text))
          .col(text(MusicPlaylist::Description))
          .to_owned(),
      )
      .await?;
    manager
      .create_table(
        Table::create()
          .table(Video::Table)
          .if_not_exists()
          .col(string_len_uniq(Video::Id, 21).primary_key())  //  nanoid
          .col(text(Video::Title))
          .col(text(Video::Creator))
          .col(array(Video::Categories, Text))
          .col(text(Video::Language))
          .col(text(Video::Region))
          .col(date(Video::DateAdded))
          .col(text(Video::Description))
          .col(text(Video::StoragePath))
          .to_owned(),
      ).await?;
    manager
      .create_table(
        Table::create()
          .table(Movie::Table)
          .if_not_exists()
          .col(string_len_uniq(Movie::Id, 21).primary_key())  //  nanoid
          .col(text(Movie::Title))
          .col(text(Movie::Director))
          .col(array(Movie::Cast, Text))
          .col(array(Movie::Genres, Text))
          .col(text(Movie::Language))
          .col(text(Movie::Region))
          .col(date(Movie::ReleaseDate))
          .col(integer(Movie::Year))
          .col(date(Movie::DateAdded))
          .col(text(Movie::Description))
          .col(text(Movie::StoragePath))
          .to_owned(),
      ).await?;
    Ok(())
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager.drop_table(Table::drop().table(Music::Table).to_owned()).await?;
    manager.drop_table(Table::drop().table(MusicPlaylist::Table).to_owned()).await?;
    manager.drop_table(Table::drop().table(Video::Table).to_owned()).await?;
    manager.drop_table(Table::drop().table(Movie::Table).to_owned()).await?;
    Ok(())
  }
}

#[derive(DeriveIden)]
enum User {
  Table,
  Id, 
  Username,
  HashedPassword,
  Salt,
  Administrator,
}

#[derive(DeriveIden)]
enum Music {
  Table,
  Id,
  Title,
  Artists,
  Genres,
  Language,
  Region,
  Album,
  DiskNumber,
  TrackNumber,
  ReleaseDate,
  Year,
  DateAdded,
  Description,
  StoragePath,
  VideoId,
}

#[derive(DeriveIden)]
enum MusicPlaylist {
  Table,
  Id,
  Title,
  Artists,
  Genres,
  ReleaseDate,
  Year,
  DateAdded,
  MusicIds,
  Description,
}

#[derive(DeriveIden)]
enum Video {
  Table,
  Id,
  Title,
  Creator,
  Categories,
  Language,
  Region,
  DateAdded,
  Description,
  StoragePath,
}

#[derive(DeriveIden)]
enum Movie {
  Table,
  Id,
  Title,
  Director,
  Cast,
  Genres,
  Language,
  Region,
  ReleaseDate,
  Year,
  DateAdded,
  Description,
  StoragePath,
}

