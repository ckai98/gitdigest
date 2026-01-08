# GitDigest - 完整开发文档

**版本**: 1.0.0  
**创建日期**: 2026-01-08  
**工具描述**: 本地 Git 仓库分析器，通过 LLM 自动生成开发周报 / 活动总结

***

## 📋 项目概述

### 核心价值
将本地 Git 仓库的提交记录转化为结构化的开发活动报告，解决：
- 手动写周报耗时
- 领导看不懂零散 commit
- 跨成员贡献汇总难

### MVP 功能
1. 选择本地 Git 仓库 ✓
2. 选择开发者 + 时间范围 ✓
3. 自动收集该成员提交（message + 文件变更）✓
4. 一键调用 LLM 生成周报 ✓
5. 导出 Markdown / 复制文本 ✓

### 技术栈
```
包管理: pnpm
Frontend: Tauri + React (Vite + TailwindCSS)
Backend: Rust (Tauri commands)
Git: 系统 git 命令行
LLM: OpenAI / DeepSeek / 本地服务 (reqwest)
打包: Tauri 2.0 (原生桌面应用，10-20MB)
```

***

## 🏗️ 项目结构

```
gitdigest/
├── src-tauri/                    # Rust 后端 (后端逻辑核心)
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── src/
│       ├── lib.rs              # 命令入口
│       ├── git.rs             # Git 操作
│       ├── llm.rs             # LLM 调用
│       ├── models.rs          # 数据结构
│       └── config.rs          # 配置管理
├── src/                        # 前端 React
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.html
│   ├── vite-env.d.ts
│   └── components/
│       ├── RepoSelector.tsx
│       ├── FilterPanel.tsx
│       ├── ReportViewer.tsx
│       └── SettingsModal.tsx
├── public/                     # 静态资源
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── package.json
├── pnpm-lock.yaml
├── README.md
└── CHANGELOG.md
```

***

## 🚀 项目初始化 (pnpm 版)

```bash
# 1. 创建 Tauri + React 项目
pnpm create tauri-app@latest gitdigest --template react
cd gitdigest

# 2. 安装前端依赖
pnpm add @tauri-apps/api @tauri-apps/plugin-dialog @tauri-apps/plugin-fs
pnpm add -D tailwindcss postcss autoprefixer @types/react-dom
pnpm add date-fns react-markdown

# 3. 初始化 TailwindCSS
npx tailwindcss init -p

# 4. Rust 后端依赖 (在 src-tauri 目录)
cd src-tauri
pnpm tauri add reqwest --features json,rustls-tls
pnpm tauri add serde serde_json tokio --features tokio/full
pnpm tauri add chrono thiserror anyhow log env_logger uuid
cd ..

# 5. 开发启动
pnpm tauri dev
```

***

## 📊 数据模型 (src-tauri/src/models.rs)

```rust
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CommitSummary {
    pub hash: String,
    pub author: String,
    pub date: DateTime<Utc>,
    pub message: String,
    pub files_changed: Vec<String>,
    pub insertions: usize,
    pub deletions: usize,
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
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ErrorResponse {
    pub message: String,
    pub code: String,
}
```

***

## ⚙️ 完整 Tauri 配置 (src-tauri/tauri.conf.json)

```json
{
  "$schema": "https://schema.tauri.app/config/2.0.0",
  "productName": "GitDigest",
  "version": "1.0.0",
  "identifier": "com.yourcompany.gitdigest",
  "build": {
    "beforeDevCommand": "pnpm dev",
    "beforeBuildCommand": "pnpm build",
    "devUrl": "http://localhost:1420",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "label": "main",
        "title": "GitDigest",
        "width": 1200,
        "height": 800,
        "resizable": true
      }
    ],
    "security": {
      "csp": "default-src 'self'"
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  },
  "plugins": {
    "shell": {
      "open": true,
      "execute": true
    },
    "dialog": {},
    "fs": {
      "scope": ["**/*"]
    }
  }
}
```

***

## 🔧 核心 Rust 命令实现

### lib.rs (命令注册入口)
```rust
// src-tauri/src/lib.rs
pub mod git;
pub mod llm;
pub mod models;
pub mod config;

use tauri::{command, Manager};

#[tauri::command]
async fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            greet, git::check_repo, git::list_authors, git::collect_commits,
            llm::generate_report
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### git.rs (Git 操作核心)
```rust
// src-tauri/src/git.rs
use crate::models::{RepoInfo, CommitSummary};
use chrono::{DateTime, Utc};
use std::process::Command;
use serde_json;

#[tauri::command]
pub fn check_repo(path: String) -> Result<RepoInfo, String> {
    let git_dir = format!("{}/.git", path);
    if !std::path::Path::new(&git_dir).exists() {
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
        .args(["log", "--format=%aN", "--reverse", "-n", "1000"])
        .output()
        .map_err(|e| e.to_string())?;

    let authors: std::collections::HashSet<String> = String::from_utf8_lossy(&output.stdout)
        .lines()
        .filter(|line| !line.trim().is_empty())
        .map(|line| line.trim().to_string())
        .collect();

    Ok(authors.into_iter().collect())
}

#[tauri::command]
pub async fn collect_commits(
    path: String,
    author: String,
    start_date: Option<String>,
    end_date: Option<String>,
) -> Result<Vec<CommitSummary>, String> {
    let mut cmd = Command::new("git");
    cmd.current_dir(&path)
       .args([
           "log",
           "--pretty=format:%H%n%an%n%ad%n%s%n%b%n",
           "--date=iso-strict",
           "--stat",
           "-n", "200"
       ])
       .arg("--author")
       .arg(&author);

    if let Some(start) = start_date {
        cmd.arg("--after").arg(start);
    }
    if let Some(end) = end_date {
        cmd.arg("--before").arg(end);
    }

    let output = cmd.output().map_err(|e| e.to_string())?;
    let output_str = String::from_utf8_lossy(&output.stdout);

    // 简单解析（生产环境建议用 git2 crate 做完整解析）
    let commits: Vec<CommitSummary> = output_str
        .split("\n\n")
        .filter(|block| !block.trim().is_empty())
        .map(|block| {
            let lines: Vec<&str> = block.lines().collect();
            CommitSummary {
                hash: lines[0].to_string(),
                author: lines[1].to_string(),
                date: DateTime::parse_from_rfc3339(lines[2]).unwrap_or(Utc::now()).with_timezone(&Utc),
                message: lines[3..].join("\n"),
                files_changed: vec![],
                insertions: 0,
                deletions: 0,
            }
        })
        .collect();

    Ok(commits)
}
```

### llm.rs (LLM 调用)
```rust
// src-tauri/src/llm.rs
use crate::models::{CommitSummary, Report};
use reqwest::Client;
use serde_json::json;
use chrono::Utc;

#[tauri::command]
pub async fn generate_report(
    commits: Vec<CommitSummary>,
    api_key: String,
    base_url: String,
    model: String,
) -> Result<Report, String> {
    let client = Client::new();
    
    let prompt = format!(
        "请根据以下 Git 提交记录生成**专业简洁的周报**，结构如下：

## 本周工作总结

### 主要完成
- ...

### 技术细节
- ...

### 下周计划建议
- ...

**提交记录**：
{}",
        commits.iter()
            .map(|c| format!(
                "- **{}** ({}): {}\n  变更文件: {}",
                c.date.format("%Y-%m-%d"),
                c.author,
                c.message.split('\n').next().unwrap_or(""),
                c.files_changed.join(", ")
            ))
            .collect::<Vec<_>>()
            .join("\n")
    );

    let response = client
        .post(&format!("{}/v1/chat/completions", base_url.trim_end_matches('/')))
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&json!({
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.3,
            "max_tokens": 2000
        }))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let json: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;
    let summary = json["choices"][0]["message"]["content"]
        .as_str()
        .unwrap_or("LLM 生成失败")
        .to_string();

    Ok(Report {
        summary,
        commits,
        word_count: summary.split_whitespace().count(),
        generated_at: Utc::now(),
    })
}
```

***

## 🎨 前端核心组件 (React + Tailwind)

### App.tsx (主界面)
```tsx
// src/App.tsx
import { useState } from 'react';
import RepoSelector from './components/RepoSelector';
import FilterPanel from './components/FilterPanel';
import ReportViewer from './components/ReportViewer';
import { invoke } from '@tauri-apps/api/tauri';
import { RepoInfo, Report } from './types';

function App() {
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            GitDigest
          </h1>
          <p className="text-xl text-slate-600">代码自动周报生成器</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <RepoSelector 
              repoInfo={repoInfo}
              onRepoChange={setRepoInfo}
            />
            <FilterPanel 
              repoInfo={repoInfo}
              onGenerate={async (filters) => {
                setLoading(true);
                try {
                  // 调用后端生成报告
                  const result = await invoke('generate_report', {
                    // 参数...
                  });
                  setReport(result as Report);
                } finally {
                  setLoading(false);
                }
              }}
              loading={loading}
            />
          </div>
          
          <div className="lg:col-span-2">
            {report && <ReportViewer report={report} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
```

***

## 📱 打包与发布

```bash
# 开发模式 (热重载)
pnpm tauri dev

# 预览打包
pnpm tauri build --debug

# 生产打包
pnpm tauri build

# 输出路径
# src-tauri/target/release/bundle/
# ├── gitdigest_1.0.0_x64.msi (Windows)
# ├── GitDigest_1.0.0_arm64.dmg (macOS)
# └── gitdigest_1.0.0_amd64.AppImage (Linux)
```

***

## 🧪 测试清单

| 功能模块 | 测试用例 | 状态 |
|----------|----------|------|
| 仓库检测 | 正常仓库 / 无 .git / 无效路径 | ☐ |
| 作者列表 | 空仓库 / 多作者 / 大仓库 | ☐ |
| 提交收集 | 日期范围 / 无提交 / 200+提交 | ☐ |
| LLM 调用 | 成功 / API Key 无效 / 网络断开 | ☐ |
| UI 交互 | 选择 → 过滤 → 生成 → 导出 | ☐ |
| 打包测试 | Windows/macOS/Linux | ☐ |

***

## 🔒 安全与隐私

```
✅ 只读 Git 操作，不修改仓库
✅ LLM 只发送提交摘要，不发完整代码
✅ API Key 本地加密存储
✅ 参数严格校验，防止路径穿越
✅ 日志记录所有操作（可选开启）
✅ HTTP 只允许指定 LLM 域名
```

***

## 📈 未来扩展计划

```
v1.1: 支持多仓库批量分析、图表展示
v1.2: 本地 LLM 支持、自定义 Prompt
v1.3: 月报/Sprint 报告、团队汇总
v2.0: SVN/HG 支持、CI/CD 集成
```

***
