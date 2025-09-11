use nanoid::nanoid;
use crate::CONFIG;

pub async fn convert_video(media_path: String) -> Result<String, anyhow::Error> {
  let stream_id = nanoid!();
  let stream_root_path = CONFIG.get().unwrap().stream_serve_root.clone();
  let stream_folder_path = stream_root_path.clone() + "/" + stream_id.as_str();
  
  tokio::fs::create_dir(stream_folder_path.as_str()).await?;
  
  let mut child = tokio::process::Command::new("ffmpeg")
    .arg("-i").arg(media_path)
    .arg("-codec").arg("copy")
    .arg("-f").arg("hls")
    .arg("-hls_list_size").arg("0")
    .arg("-hls_time").arg("4")
    .arg("-hls_segment_type").arg("mpegts")
    .arg("-hls_flags").arg("independent_segments")
    .arg("-hls_segment_filename").arg(format!("{}/data%03d.ts", stream_folder_path))
    .arg(format!("{}/stream.m3u8", stream_folder_path))
    .spawn()?;
  child.wait().await?;
  //  TODO error handling
  
  Ok(stream_id)
}