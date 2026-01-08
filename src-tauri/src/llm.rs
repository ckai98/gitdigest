use crate::config::get_config;
use crate::models::{CommitSummary, Report};
use chrono::Utc;
use reqwest::Client;
use serde_json::json;
use tauri::AppHandle;

#[tauri::command]
pub async fn generate_report(
    app: AppHandle,
    commits: Vec<CommitSummary>,
) -> Result<Report, String> {
    let config = get_config(app).await?;

    let api_key = config
        .api_key
        .ok_or("API Key not configured. Please go to Settings.")?;
    if api_key.trim().is_empty() {
        return Err("API Key is empty".to_string());
    }

    let client = Client::new();

    let language = config.language.unwrap_or_else(|| "zh".to_string());

    let prompt_instruction = if language == "en" {
        "Please generate a **professional weekly status report** (in English) based on the following git commits.
        
Structure:
## Weekly Summary
### Key Achievements
- ...
### Technical Details
- ...
### Next Week Plan
- ..."
    } else {
        "请根据以下 git commits 生成一份**专业的周报**（使用中文）。
        
结构:
## 本周工作总结
### 主要完成
- ...
### 技术细节
- ...
### 下周计划建议
- ..."
    };

    let prompt = format!(
        "{}

**Commits**:
{}",
        prompt_instruction,
        commits
            .iter()
            .take(50) // Limit prompt size for safety
            .map(|c| format!(
                "- {} ({}): {}",
                c.date.format("%Y-%m-%d"),
                c.author,
                c.message
            ))
            .collect::<Vec<_>>()
            .join("\n")
    );

    let body = json!({
        "model": config.model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "max_tokens": 2000
    });

    let res = client
        .post(&format!(
            "{}/chat/completions",
            config.base_url.trim_end_matches('/')
        ))
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Network request failed: {}", e))?;

    if !res.status().is_success() {
        let error_text = res.text().await.unwrap_or_default();
        return Err(format!("LLM API Error: {}", error_text));
    }

    let json: serde_json::Value = res
        .json()
        .await
        .map_err(|e| format!("Failed to parse JSON: {}", e))?;
    let summary = json["choices"][0]["message"]["content"]
        .as_str()
        .unwrap_or("LLM response format unexpected")
        .to_string();

    let word_count = summary.chars().count();

    Ok(Report {
        summary,
        commits,
        word_count,
        generated_at: Utc::now(),
        model_used: config.model,
    })
}
