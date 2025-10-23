#[derive(clap::Parser, Debug)]
pub struct Args {
  /// Prints detailed information
  #[arg(short, long, action = clap::ArgAction::Count)]
  pub verbose: u8,

  /// Enables logging to system logger (syslog, os_log) and disables stdout
  #[arg(short_alias = 'D', long, default_value_t = false)]
  pub daemon_mode: bool,
  /// Filter level of logging
  #[arg(long, default_value_t = 30)]
  pub log_level: u8,
}