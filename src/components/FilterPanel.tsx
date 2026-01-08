import { RepoInfo } from '../types';
import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { subDays, format } from 'date-fns';
// @ts-ignore
import { invoke } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';

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
            // @ts-ignore
            const config = await invoke('get_config');
            // @ts-ignore
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
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <span>🔍</span> {t('filter.title')}
                </h2>
                <div className="flex items-center gap-2">
                    <span className={clsx("w-2 h-2 rounded-full", isConfigured ? "bg-green-500" : "bg-red-500")} />
                    <span className="text-xs text-slate-500">{isConfigured ? t('filter.llmReady') : t('filter.noKey')}</span>
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('open-settings'))}
                        className="text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded text-slate-600 transition-colors"
                    >
                        {t('filter.config')}
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('filter.author')}</label>
                    <select
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        disabled={!repoInfo}
                        className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border disabled:opacity-50"
                    >
                        <option value="All Authors">{t('filter.allAuthors')}</option>
                        {repoInfo?.authors.map((a) => (
                            <option key={a} value={a}>{a}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('filter.startDate')}</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('filter.endDate')}</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        />
                    </div>
                </div>

                <button
                    onClick={handleSearch}
                    disabled={!repoInfo || loading}
                    className={clsx(
                        "w-full py-2.5 px-4 rounded-lg text-slate-700 font-medium border border-slate-200 hover:bg-slate-50 transition-colors mb-3",
                        !repoInfo ? "opacity-50 cursor-not-allowed" : ""
                    )}
                >
                    🔍 {t('filter.search', '搜索提交记录')}
                </button>

                <div className="border-t border-slate-100 my-4 pt-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">报告模式</label>
                    <div className="flex bg-slate-100 p-1 rounded-lg mb-4">
                        <button
                            onClick={() => setMode('simple')}
                            className={clsx(
                                "flex-1 py-1 px-3 rounded-md text-sm font-medium transition-all",
                                mode === 'simple' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            📝 简单摘要
                        </button>
                        <button
                            onClick={() => setMode('detailed')}
                            className={clsx(
                                "flex-1 py-1 px-3 rounded-md text-sm font-medium transition-all",
                                mode === 'detailed' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            🔬 深度代码
                        </button>
                    </div>

                    <button
                        onClick={() => onGenerate(mode)}
                        disabled={!hasCommits || loading || !isConfigured}
                        className={clsx(
                            "w-full py-3 px-4 rounded-lg text-white font-medium transition-all transform active:scale-95 shadow-lg",
                            !hasCommits || !isConfigured
                                ? "bg-slate-300 cursor-not-allowed shadow-none"
                                : loading
                                    ? "bg-blue-400 cursor-wait"
                                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/30"
                        )}
                    >
                        {loading
                            ? t('filter.generating')
                            : !hasCommits
                                ? "请先搜索提交"
                                : isConfigured
                                    ? (mode === 'simple' ? "生成周报" : "生成深度报告")
                                    : t('filter.configureFirst')}
                    </button>
                </div>
            </div>
        </div>
    );
}
