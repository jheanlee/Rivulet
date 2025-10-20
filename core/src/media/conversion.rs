use nanoid::nanoid;
use crate::CONFIG;

pub async fn convert_video(target: String) -> Result<String, anyhow::Error> {
  let stream_id = nanoid!();
  let stream_root = CONFIG.get().unwrap().stream_root.as_str();
  let stream_target_dir = format!("{stream_root}/{stream_id}");

  tokio::fs::create_dir_all(stream_target_dir.as_str()).await?;

  let mut child = tokio::process::Command::new("ffmpeg")
    .arg("-i").arg(target)
    .arg("-codec").arg("copy")
    .arg("-f").arg("hls")
    .arg("-hls_list_size").arg("0")
    .arg("-hls_time").arg("4")
    .arg("-hls_segment_type").arg("mpegts")
    .arg("-hls_flags").arg("independent_segments")
    .arg("-hls_segment_filename").arg(format!("{stream_target_dir}/data%03d.ts"))
    .arg(format!("{stream_target_dir}/stream.m3u8"))
    .spawn()?;
  let res = child.wait().await?;
  println!("{}", res);

  Ok(stream_id)
}