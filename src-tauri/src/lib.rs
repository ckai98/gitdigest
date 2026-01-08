pub mod config;
pub mod git;
pub mod llm;
pub mod models;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            git::check_repo,
            git::list_authors,
            git::collect_commits,
            git::get_commit_diffs,
            llm::generate_report,
            config::save_config,
            config::get_config
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
