export interface CommitSummary {
    hash: string;
    author: string;
    date: string;
    message: string;
    files_changed: string[];
    insertions: number;
    deletions: number;
}

export interface RepoInfo {
    path: string;
    branch: string;
    is_valid: boolean;
    authors: string[];
    last_commit: string | null;
}

export interface Report {
    summary: string;
    commits: CommitSummary[];
    word_count: number;
    generated_at: string;
    model_used: string;
}

export interface AppConfig {
    api_key: string | null;
    provider: string;
    base_url: string;
    model: string;
    language: string;
}
