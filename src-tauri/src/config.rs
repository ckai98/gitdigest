use serde::{Deserialize, Serialize};
use serde_json::json;
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppConfig {
    pub api_key: Option<String>,
    pub provider: String, // "openai", "deepseek", "custom"
    pub base_url: String,
    pub model: String,
    pub language: Option<String>,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            api_key: None,
            provider: "openai".to_string(),
            base_url: "https://api.openai.com/v1".to_string(),
            model: "gpt-3.5-turbo".to_string(),
            language: Some("zh".to_string()),
        }
    }
}

// In a real app we might use `secrecy` for api_key in memory,
// but for simple storage json logic we use String here.
// The tauri store saves to disk.

#[tauri::command]
pub async fn save_config(app: AppHandle, config: AppConfig) -> Result<(), String> {
    let store = app.store("config.json").map_err(|e| e.to_string())?;

    store.set("api_key", json!(config.api_key));
    store.set("provider", json!(config.provider));
    store.set("base_url", json!(config.base_url));
    store.set("model", json!(config.model));
    store.set("language", json!(config.language));

    store.save().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn get_config(app: AppHandle) -> Result<AppConfig, String> {
    let store = app.store("config.json").map_err(|e| e.to_string())?;

    let api_key = store
        .get("api_key")
        .and_then(|v| v.as_str().map(String::from));
    let provider = store
        .get("provider")
        .and_then(|v| v.as_str().map(String::from))
        .unwrap_or_else(|| "openai".to_string());
    let base_url = store
        .get("base_url")
        .and_then(|v| v.as_str().map(String::from))
        .unwrap_or_else(|| "https://api.openai.com/v1".to_string());
    let model = store
        .get("model")
        .and_then(|v| v.as_str().map(String::from))
        .unwrap_or_else(|| "gpt-3.5-turbo".to_string());
    let language = store
        .get("language")
        .and_then(|v| v.as_str().map(String::from))
        .or(Some("zh".to_string()));

    Ok(AppConfig {
        api_key,
        provider,
        base_url,
        model,
        language,
    })
}
