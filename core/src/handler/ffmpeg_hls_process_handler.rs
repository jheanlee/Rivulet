use std::collections::HashSet;
use std::future::Future;
use std::pin::Pin;
use std::sync::Arc;
use tokio::select;
use tokio::sync::{mpsc, RwLock};
use tokio_util::task::JoinMap;
use crate::common::error::ApiError;

pub async fn ffmpeg_hls_process_handler(
  process_running: Arc<RwLock<HashSet<String>>>,
  mut receiver: mpsc::Receiver<(String, Pin<Box<dyn Future<Output=()> + Send + 'static>>)>
) -> Result<(), ApiError> {
  let mut join_map = JoinMap::new();

  loop {
    if join_map.is_empty() {
      if let Some((id, new_task)) = receiver.recv().await {
        let mut set = process_running.write().await;
        join_map.spawn(id.clone(), new_task);
        set.insert(id);
      }
    }

    select! {
      Some((id, _res)) = join_map.join_next() => {
        let mut set = process_running.write().await;
        set.remove(&id);
      },
      Some((id, new_task)) = receiver.recv() => {
        let mut set = process_running.write().await;
        join_map.spawn(id.clone(), new_task);
        set.insert(id);
      }
    }
  }
}