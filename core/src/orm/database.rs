use sea_orm::{Database, DatabaseConnection, DbErr};

pub async fn connect_database(db_url: String) -> Result<DatabaseConnection, DbErr> {
  Ok(Database::connect(format!("postgres://{db_url}")).await?)
}