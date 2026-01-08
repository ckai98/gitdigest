export const zh = {
    translation: {
        app: {
            title: "GitDigest",
            subtitle: "AI 驱动的开发周报生成器",
            settings: "设置"
        },
        repo: {
            label: "代码仓库",
            select: "点击选择 Git 项目",
            analyzing: "分析中...",
            valid: "有效 Git 仓库",
            change: "更改"
        },
        filter: {
            title: "筛选条件",
            author: "提交者",
            allAuthors: "所有作者",
            startDate: "开始日期",
            endDate: "结束日期",
            generate: "生成周报",
            generating: "生成中...",
            configureFirst: "请先配置 LLM",
            config: "配置",
            llmReady: "LLM 就绪",
            noKey: "未配置 Key"
        },
        report: {
            tabReport: "周报预览",
            tabCommits: "源提交记录",
            copy: "复制 Markdown",
            copied: "周报已复制到剪贴板！",
            generatedBy: "生成模型",
            chars: "字符",
            placeholder: {
                title: "准备生成",
                subtitle: "请选择仓库和筛选条件以开始"
            }
        },
        settings: {
            title: "LLM 配置",
            provider: "供应商",
            baseUrl: "API 地址 (Base URL)",
            apiKey: "API Key",
            model: "模型名称",
            language: "界面语言",
            cancel: "取消",
            save: "保存配置",
            saving: "保存中...",
            saved: "设置已保存！",
            required: "API Key 不能为空"
        },
        toast: {
            foundCommits: "找到 {{count}} 条提交。正在生成周报...",
            noCommits: "该时间段内无提交记录",
            generated: "周报生成完毕",
            error: "错误: {{message}}",
            repoLoaded: "已加载仓库，分支: {{branch}}",
            notGit: "不是有效的 Git 仓库 (未找到 .git 文件夹)"
        }
    }
};
