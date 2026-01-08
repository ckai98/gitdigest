use crate::models::{CommitSummary, RepoInfo};
use chrono::{DateTime, Utc};
use std::path::Path;
use std::process::Command;

#[tauri::command]
pub fn check_repo(path: String) -> Result<RepoInfo, String> {
    let git_dir = Path::new(&path).join(".git");
    if !git_dir.exists() {
        return Ok(RepoInfo {
            path,
            branch: "".to_string(),
            is_valid: false,
            authors: vec![],
            last_commit: None,
        });
    }

    let branch_output = Command::new("git")
        .current_dir(&path)
        .args(["rev-parse", "--abbrev-ref", "HEAD"])
        .output()
        .map_err(|e| e.to_string())?;

    let branch = String::from_utf8_lossy(&branch_output.stdout)
        .trim()
        .to_string();

    Ok(RepoInfo {
        path,
        branch,
        is_valid: true,
        authors: vec![],
        last_commit: None,
    })
}

#[tauri::command]
pub fn list_authors(path: String) -> Result<Vec<String>, String> {
    let output = Command::new("git")
        .current_dir(&path)
        .args(["log", "--format=%aN", "--reverse", "-n", "1000"]) // Cap check to recent 1000 commits
        .output()
        .map_err(|e| e.to_string())?;

    let authors: std::collections::HashSet<String> = String::from_utf8_lossy(&output.stdout)
        .lines()
        .filter(|line| !line.trim().is_empty())
        .map(|line| line.trim().to_string())
        .collect();

    let mut sorted_authors: Vec<String> = authors.into_iter().collect();
    sorted_authors.sort();

    Ok(sorted_authors)
}

#[tauri::command]
pub async fn collect_commits(
    path: String,
    author: String,
    start_date: Option<String>,
    end_date: Option<String>,
    max_commits: Option<usize>,
) -> Result<Vec<CommitSummary>, String> {
    let mut cmd = Command::new("git");
    cmd.current_dir(&path).args([
        "log",
        "--pretty=format:%H%n%an%n%ad%n%s%n%b%n",
        "--date=iso-strict",
        "--stat",
    ]);

    // Safety: Limit commits
    let limit = max_commits.unwrap_or(100).min(500); // Hard cap at 500
    cmd.arg("-n").arg(limit.to_string());

    if !author.is_empty() && author != "All Authors" {
        cmd.arg("--author").arg(&author);
    }

    if let Some(start) = start_date {
        if !start.is_empty() {
            cmd.arg("--after").arg(start);
        }
    }
    if let Some(end) = end_date {
        if !end.is_empty() {
            cmd.arg("--before").arg(end);
        }
    }

    let output = cmd.output().map_err(|e| e.to_string())?;
    let output_str = String::from_utf8_lossy(&output.stdout);

    let commits: Vec<CommitSummary> = output_str
        .split("\n\n")
        .filter(|block| !block.trim().is_empty())
        .filter_map(|block| {
            let lines: Vec<&str> = block.lines().collect();
            if lines.len() < 3 {
                return None;
            }

            let hash = lines.get(0)?.to_string();
            // Git log hash is 40 chars
            if hash.len() < 7 {
                return None;
            }

            let author = lines.get(1)?.to_string();
            let date_str = lines.get(2)?;
            let date = DateTime::parse_from_rfc3339(date_str)
                .ok()?
                .with_timezone(&Utc);

            // Message is the rest until we hit stats usually.
            // Stats usually start with " file changed, ..." or similar or list of files.

            // For MVP simplicity, just taking the subject (4th line if exists)
            let message = lines.get(3).unwrap_or(&"").to_string();

            Some(CommitSummary {
                hash,
                author,
                date,
                message,
                files_changed: vec![],
                insertions: 0,
                deletions: 0,
            })
        })
        .collect();

    Ok(commits)
}
