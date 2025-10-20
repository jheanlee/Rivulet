#[derive(serde::Serialize, serde::Deserialize)]
pub struct UploadMetadataMusic {
  pub title: String,
  pub artists: Vec<String>,
  pub genres: Vec<String>,
  pub language: String,
  pub region: String,
  pub album: String,
  pub disk_number: Option<i32>,
  pub track_number: Option<i32>,
  pub release_date: Option<String>,
  pub year: Option<i32>,
  pub description: String,
  pub video_id: String,
}


#[derive(serde::Serialize, serde::Deserialize)]
pub struct UploadMetadataMovie {
  pub title: String,
  pub director: String,
  pub cast: Vec<String>,
  pub genres: Vec<String>,
  pub language: String,
  pub region: String,
  pub release_date: Option<String>,
  pub year: Option<i32>,
  pub description: String,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct UploadMetadataVideo {
  pub title: String,
  pub creator: String,
  pub categories: Vec<String>,
  pub language: String,
  pub region: String,
  pub description: String,
}
