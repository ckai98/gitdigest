# GitDigest 🚀

<div align="center">

![GitDigest Logo](https://via.placeholder.com/150?text=GitDigest) <!-- 替换为你的 Logo 链接 -->

**智能生成开发周报，让 Git 提交记录不再枯燥**

[功能特性](#-功能特性) • [下载安装](#-下载安装) • [快速开始](#-快速开始) • [贡献指南](#-贡献指南)

[![Tauri](https://img.shields.io/badge/Tauri-v2.0-orange?style=flat-square&logo=tauri)](https://tauri.app)
[![React](https://img.shields.io/badge/React-v19-blue?style=flat-square&logo=react)](https://react.dev)
[![Rust](https://img.shields.io/badge/Rust-Backend-brown?style=flat-square&logo=rust)](https://www.rust-lang.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## 📖 简介 | Introduction

**GitDigest** 是一款基于 Tauri 2.0 构建的现代化跨平台桌面应用。它致力于解决开发者写周报时的痛点——如何将碎片化的 Git 提交记录，转化为条理清晰、具备业务价值的总结报告。

通过集成 OpenAI / DeepSeek 等 LLM 能力，GitDigest 能智能分析你的代码变更，自动生成包含「工作产出」、「技术细节」及「下周计划」的专业周报。

## ✨ 功能特性 | Features

- 🖥️ **跨平台支持**: 完美运行于 Windows, macOS 和 Linux，轻量级原生体验（安装包仅 ~10MB）。
- 📂 **智能仓库分析**: 自动读取本地 Git 仓库，无需上传代码到云端，保护隐私。
- 🔍 **精准过滤**: 支持按 **开发者**、**时间范围** 筛选提交记录，精准定位周报内容。
- 🧠 **AI 驱动总结**: 内置 LLM 连接能力（OpenAI/DeepSeek），一键将 Commit Log 转化为自然语言日报/周报。
- 🌐 **多语言支持**: 内置国际化 (i18n) 支持，随时切换语言。
- 🎨 **现代化 UI**: 采用各种现代化设计组件，不仅好用，更是好看。
- 🔒 **隐私安全**: API Key 本地加密存储，代码仅在本地分析，只发送摘要给 LLM。

## 📸 截图预览 | Screenshots

| 主界面 | 生成报告 |
| :-: | :-: |
| ![Main UI](https://via.placeholder.com/600x400?text=Dashboard+Preview) | ![Report UI](https://via.placeholder.com/600x400?text=Report+Generation) |

> *（截图待补充，建议运行程序后截图替换此处链接）*

## 📥 下载安装 | Installation

目前处于早期开发阶段，您可以从 [Releases](https://github.com/ckai/gitdigest/releases) 页面下载最新构建版本，或通过源码编译。

## ⚡ 快速开始 | Quick Start

### 1. 环境准备
确保您的系统已安装以下环境：
- [Node.js](https://nodejs.org/) (推荐 v18+)
- [Rust](https://www.rust-lang.org/tools/install) (且已配置好 cargo 环境)
- [pnpm](https://pnpm.io/)

### 2. 克隆项目
```bash
git clone https://github.com/ckai/gitdigest.git
cd gitdigest
```

### 3. 安装依赖
```bash
# 安装前端依赖
pnpm install

# 安装 Rust 后端依赖 (通常会自动处理，若报错可手动执行)
cd src-tauri && cargo fetch
```

### 4. 启动开发模式
```bash
pnpm tauri dev
```
首次启动会编译 Rust 后端，可能需要几分钟，请耐心等待。

## 🛠️ 技术栈 | Tech Stack

- **Core**: [Tauri v2](https://v2.tauri.app/) (Rust + WebView)
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: TailwindCSS + PostCSS
- **State/Logic**: React Hooks + Tauri Commands
- **Git Integration**: Native Git Command via Rust `std::process::Command`

## 🤝 贡献指南 | Contributing

欢迎任何形式的贡献！无论是新功能建议、代码提交还是 Bug 反馈。

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 📄 许可证 | License

本项目基于 [MIT 许可证](LICENSE) 分发。详情请参阅 `LICENSE` 文件。

---

<div align="center">
Made with ❤️ by ckai
</div>
