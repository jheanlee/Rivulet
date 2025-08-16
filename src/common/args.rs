
#[derive(clap::Parser, Debug)]
pub struct Args {
  #[arg(short, long)]
  pub media_root: String,
  #[arg(short, long)]
  pub stream_root: String,
}