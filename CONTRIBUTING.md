# 贡献指南 | Contributing Guide

首先，感谢你有兴趣为 GitDigest 做贡献！🎉

我们要想把 GitDigest 做成最好的 Git 周报生成工具，离不开社区的帮助。

## 🤝 行为准则

我们希望打造一个友好、包容的社区。请在交流时保持专业和尊重。

## 🛠️ 如何开始

1.  **Fork 本仓库**：点击右上角的 Fork 按钮。
2.  **克隆代码**：`git clone` 你 Fork 后的仓库到本地。
3.  **安装依赖**：
    *   前端：`pnpm install`
    *   后端：确保安装了 Rust 和 Cargo。
4.  **运行开发环境**：`pnpm tauri dev`

## 🐛 提交 Bug

如果你发现了 Bug，请在 Issues 中提交，并包含以下信息：
*   操作系统版本 (Windows/macOS/Linux)
*   GitDigest 版本
*   复现步骤
*   期望结果 vs 实际结果
*   (可选) 截图或报错日志

## 💡 提交新功能 (Feature Request)

如果你有新点子，欢迎在 Issues 中通过 "Feature Request" 标签提议。在那之前，请先搜索一下是否已经有人提过了。

## 💻 提交代码 (Pull Request)

1.  从 `main` 分支切出一个新分支：`git checkout -b feature/my-cool-feature`
2.  提交代码，请保持代码风格与现有代码一致。
3.  确保项目能正常编译运行。
4.  提交 PR，并在描述中说明你做了什么修改。

## 🌍 国际化 (i18n)

如果你想帮忙翻译 GitDigest 到其他语言，请在 `src/locales` 目录下查找相关文件。我们非常欢迎！

---

再次感谢你的贡献！
