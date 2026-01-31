use std::str::from_utf8;
use crate::common::error::ApiError;

#[derive(Debug)]
pub enum VideoCodec {
  H264,
  //  H265 not supported on non-Apple systems
  //  AV1 not supported on non-Apple systems
  Unsupported(String)
}
#[derive(Debug)]
pub enum AudioCodec {
  AAC,
  AC3,
  EAC3,
  Unsupported(String)
}

pub async fn get_video_codec(path: &str) -> Result<VideoCodec, ApiError> {
  let mut child = tokio::process::Command::new("ffprobe")
    .arg("-v").arg("quiet")
    .arg("-select_streams").arg("v:0")
    .arg("-show_entries").arg("stream=codec_name")
    .arg("-of").arg("default=noprint_wrappers=1:nokey=1")
    .arg(path)
    .output().await?;

  if child.status.success() {
    match child.stdout.get(0..) {
      Some(val) => {
        match from_utf8(val) {
          Ok(val) if val == "h264\n"=> Ok(VideoCodec::H264),
          Ok(val) => Ok(VideoCodec::Unsupported(val.to_string())),
          Err(error) => Err(error.into())
        }
      }
      None => Err(ApiError::BadRequest)
    }
  } else {
    Err(ApiError::BadRequest)
  }
}

pub async fn get_audio_codec(path: &str) -> Result<AudioCodec, ApiError> {
  let mut child = tokio::process::Command::new("ffprobe")
    .arg("-v").arg("quiet")
    .arg("-select_streams").arg("a:0")
    .arg("-show_entries").arg("stream=codec_name")
    .arg("-of").arg("default=noprint_wrappers=1:nokey=1")
    .arg(path)
    .output().await?;

  if child.status.success() {
    match child.stdout.get(0..) {
      Some(val) => {
        match from_utf8(val) {
          Ok(val) if val == "aac\n" => Ok(AudioCodec::AAC),
          Ok(val) if val == "ac3\n" => Ok(AudioCodec::AC3),
          Ok(val) if val == "eac3\n" => Ok(AudioCodec::EAC3),
          Ok(val) => Ok(AudioCodec::Unsupported(val.to_string())),
          Err(error) => Err(error.into())
        }
      }
      None => Err(ApiError::BadRequest)
    }
  } else {
    Err(ApiError::BadRequest)
  }
}