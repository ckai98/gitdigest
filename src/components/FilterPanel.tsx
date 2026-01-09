import { RepoInfo } from '../types';
import { useState, useEffect } from 'react';
import { subDays, format } from 'date-fns';
import { invoke } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';
import CollapsiblePanel from './ui/CollapsiblePanel';

interface Props {
    repoInfo: RepoInfo | null;
    onSearch: (filters: { author: string; startDate: string; endDate: string }) => void;
    onGenerate: (mode: 'simple' | 'detailed') => void;
    loading: boolean;
    hasCommits: boolean;
}

export default function FilterPanel({ repoInfo, onSearch, onGenerate, loading, hasCommits }: Props) {
    const { t } = useTranslation();
    const [author, setAuthor] = useState('All Authors');
    const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [isConfigured, setIsConfigured] = useState(false);
    const [mode, setMode] = useState<'simple' | 'detailed'>('simple');

    // Check if config exists
    useEffect(() => {
        checkConfig();
        const interval = setInterval(checkConfig, 2000);
        return () => clearInterval(interval);
    }, []);

    const checkConfig = async () => {
        try {
            const config = await invoke<{ api_key?: string }>('get_config');
            setIsConfigured(!!config.api_key && config.api_key.length > 0);
        } catch {
            setIsConfigured(false);
        }
    };

    const handleSearch = () => {
        onSearch({
            author,
            startDate: startDate ? new Date(startDate).toISOString() : '',
            endDate: endDate ? new Date(endDate).toISOString() : '',
        });
    };

    return (
        <CollapsiblePanel
            title={t('filter.title')}
            icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            }
            defaultExpanded={true}
        >
            <div className="space-y-4">
                {/* Author Select */}
                <div>
                    <label className="block text-xs font-medium text-content-secondary mb-1.5">
                        {t('filter.author')}
                    </label>
                    <select
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        disabled={!repoInfo}
                        className="select-field disabled:opacity-50"
                    >
                        <option value="All Authors">{t('filter.allAuthors')}</option>
                        {repoInfo?.authors.map((a) => (
                            <option key={a} value={a}>{a}</option>
                        ))}
                    </select>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-content-secondary mb-1.5">
                            {t('filter.startDate')}
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="input-field"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-content-secondary mb-1.5">
                            {t('filter.endDate')}
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="input-field"
                        />
                    </div>
                </div>

                {/* Search Button */}
                <button
                    onClick={handleSearch}
                    disabled={!repoInfo || loading}
                    className="btn-secondary w-full text-sm py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-content-tertiary/30 border-t-content-tertiary rounded-full animate-spin" />
                            搜索中...
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {t('filter.search', '搜索提交记录')}
                        </span>
                    )}
                </button>

                {/* Divider */}
                <div className="border-t border-border my-2" />

                {/* Report Mode */}
                <div>
                    <label className="block text-xs font-medium text-content-secondary mb-2">
                        报告模式
                    </label>
                    <div className="flex bg-surface-tertiary p-1 rounded-lg">
                        <button
                            onClick={() => setMode('simple')}
                            className={`
                                flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all duration-200
                                ${mode === 'simple'
                                    ? 'bg-surface-secondary text-content-primary shadow-sm'
                                    : 'text-content-tertiary hover:text-content-secondary'
                                }
                            `}
                        >
                            <span className="flex items-center justify-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                简单摘要
                            </span>
                        </button>
                        <button
                            onClick={() => setMode('detailed')}
                            className={`
                                flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all duration-200
                                ${mode === 'detailed'
                                    ? 'bg-surface-secondary text-accent shadow-sm'
                                    : 'text-content-tertiary hover:text-content-secondary'
                                }
                            `}
                        >
                            <span className="flex items-center justify-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                                深度代码
                            </span>
                        </button>
                    </div>
                </div>

                {/* Generate Button */}
                <button
                    onClick={() => onGenerate(mode)}
                    disabled={!hasCommits || loading || !isConfigured}
                    className={`
                        w-full py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200
                        ${!hasCommits || !isConfigured
                            ? 'bg-surface-tertiary text-content-tertiary cursor-not-allowed'
                            : loading
                                ? 'btn-primary opacity-75 cursor-wait'
                                : 'btn-primary'
                        }
                    `}
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            {t('filter.generating')}
                        </span>
                    ) : !hasCommits ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            请先搜索提交
                        </span>
                    ) : !isConfigured ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            {t('filter.configureFirst')}
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                            {mode === 'simple' ? '生成周报' : '生成深度报告'}
                        </span>
                    )}
                </button>
            </div>
        </CollapsiblePanel>
    );
}
