
#[derive(clap::Parser, Debug)]
pub struct Args {
  /// Prints detailed information
  #[arg(short, long, action = clap::ArgAction::Count)]
  pub verbose: u8,

  /// Database server url (supported backend: PostgresSQL)
  /// Example: "user:password@localhost:5432/rivulet"
  #[arg(short, long)]
  pub database_url: String,

  /// Enables logging to system logger (syslog, os_log) and disables stdout
  #[arg(short_alias = 'D', long, default_value_t = false)]
  pub daemon_mode: bool,
  /// Filter level of logging
  #[arg(long, default_value_t = 30)]
  pub log_level: u8,
}