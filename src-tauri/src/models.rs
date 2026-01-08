use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CommitSummary {
    pub hash: String,
    pub author: String,
    pub date: DateTime<Utc>,
    pub message: String,
    pub files_changed: Vec<String>,
    pub insertions: usize,
    pub deletions: usize,
    pub diff: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RepoInfo {
    pub path: String,
    pub branch: String,
    pub is_valid: bool,
    pub authors: Vec<String>,
    pub last_commit: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Report {
    pub summary: String,
    pub commits: Vec<CommitSummary>,
    pub word_count: usize,
    pub generated_at: DateTime<Utc>,
    pub model_used: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ErrorResponse {
    pub message: String,
    pub code: String,
}
