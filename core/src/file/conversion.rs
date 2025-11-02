use tokio::fs::{try_exists, File};
use tokio::io::{AsyncBufReadExt, BufReader};
use crate::common::error::ApiError;
use crate::CONFIG;
use crate::file::codec::{get_audio_codec, get_video_codec, AudioCodec, VideoCodec};

pub async fn convert_hls(id: &str, path: &str) -> Result<(), ApiError> {
  let stream_root = CONFIG.get().unwrap().stream_root.as_str();
  let stream_out_dir = format!("{stream_root}/{id}");

  tokio::fs::create_dir_all(stream_out_dir.as_str()).await?;


  match check_hls_stream(id).await {
    Ok(exists) if exists => {}
    _ => {
      let hls_segment_filename = format!("{stream_out_dir}/data%03d.ts");
      let master_filename = format!("{stream_out_dir}/stream.m3u8");

      let mut args = Vec::from([
        "-i", path,
      ]);

      match get_video_codec(path).await? {
        VideoCodec::Unsupported(_) => {
          args.push("-codec:v");
          args.push("libx264");
        }
        _ => {
          args.push("-codec:v");
          args.push("copy");
        }
      }

      match get_audio_codec(path).await? {
        AudioCodec::Unsupported(_) => {
          args.push("-codec:a");
          args.push("mp3");
        }
        _ => {
          args.push("-codec:a");
          args.push("copy");
        }
      }

      args.append(&mut Vec::from([
        "-f", "hls",
        "-hls_list_size", "0",
        "-hls_time", "4",
        "-hls_segment_type", "mpegts",
        "-hls_flags", "independent_segments",
        "-hls_segment_filename", hls_segment_filename.as_str(),
        master_filename.as_str()
      ]));

      let _child_command = tokio::process::Command::new("ffmpeg")
        .args(args)
        .spawn()?;
    }
  }

  Ok(())
}

async fn check_hls_stream(id: &str) -> Result<bool, ApiError> {
  let stream_root = CONFIG.get().unwrap().stream_root.as_str();
  let hls_master = format!("{stream_root}/{id}/stream.m3u8");

  if try_exists(hls_master.as_str()).await? {
    let file = File::open(hls_master).await?;
    let mut reader = BufReader::new(file);
    let mut buffer = String::new();

    while reader.read_line(&mut buffer).await? > 0 {
      match buffer.chars().nth(0) {
        Some(char) if char == '#' => { continue; },
        Some(_) if try_exists(buffer.as_str()).await? => { continue; }
        _ => { return Ok(false); }
      }
    }

    Ok(true)
  } else {
    Ok(false)
  }
}