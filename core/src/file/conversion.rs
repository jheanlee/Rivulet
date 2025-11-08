use std::time::Duration;
use tokio::fs::{try_exists, File};
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::time::sleep;
use crate::common::error::ApiError;
use crate::{CONFIG, SHARED};
use crate::file::codec::{get_audio_codec, get_video_codec, AudioCodec, VideoCodec};

pub async fn convert_hls(id: &str, path: &str) -> Result<(), ApiError> {
  let stream_root = CONFIG.get().unwrap().stream_root.as_str();
  let stream_out_dir = format!("{stream_root}/{id}");

  tokio::fs::create_dir_all(stream_out_dir.as_str()).await?;

  let processes_running = SHARED.get().unwrap().ffmpeg_hls_processes_running.clone();
  let processes_running = processes_running.read().await;

  if !(*processes_running).contains(&String::from(id)) {
    match check_hls_stream(id).await {
      Ok(exists) if exists => {}
      _ => {
        let hls_segment_filename = format!("{stream_out_dir}/data%03d.ts");
        let master_filename = format!("{stream_out_dir}/stream.m3u8");

        let mut args = Vec::with_capacity(23);
        args.extend_from_slice(&[
          "-i", path,
          "-crf", "18",
          "-b:a", "192k"
        ]);

        match get_video_codec(path).await? {
          VideoCodec::Unsupported(_) => {
            args.push("-codec:v");
            if CONFIG.get().unwrap().hardware_acceleration && cfg!(target_os = "macos") {
              args.push("h264_videotoolbox");
            } else if false { //  TODO
              args.push("h264_vaapi"); //  TODO test
            } else {
              args.push("libx264");
            }
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

        args.extend_from_slice(&[
          "-f", "hls",
          "-hls_list_size", "0",
          "-hls_time", "6",
          "-hls_segment_type", "mpegts",
          "-hls_flags", "independent_segments",
          "-hls_segment_filename", hls_segment_filename.as_str(),
          master_filename.as_str()
        ]);

        let args_strings: Vec<String> = args.into_iter().map(String::from).collect();

        if let Ok(mut child) = tokio::process::Command::new("ffmpeg")
          .args(args_strings)
          .spawn() {
          let process_future = async move {
            let _res = child.wait().await;
          };
          let _res = SHARED.get().unwrap().ffmpeg_hls_process_sender.clone().send((String::from(id), Box::pin(process_future))).await;
        }

        sleep(Duration::from_millis(3000)).await;
      }
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

    let mut file_complete = true;
    let mut hls_complete = false;

    while reader.read_line(&mut buffer).await? > 0 {
      if buffer == "#EXT-X-ENDLIST\n" {
        hls_complete = true;
      } else {
        match buffer.chars().nth(0) {
          Some(char) if char == '#' => {}
          Some(char) if char.is_alphanumeric() => {
            if !try_exists(format!("{stream_root}/{id}/{}", buffer.as_str().trim_end())).await? {
              file_complete = false;
              break;
            }
          }
          _ => {}
        }
      }
      buffer.clear();
    }

    Ok(file_complete && hls_complete)
  } else {
    Ok(false)
  }
}