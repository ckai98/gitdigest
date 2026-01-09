import { open } from '@tauri-apps/plugin-dialog';
import { RepoInfo } from '../types';
import { invoke } from '@tauri-apps/api/core';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import CollapsiblePanel from './ui/CollapsiblePanel';

interface Props {
    repoInfo: RepoInfo | null;
    onRepoChange: (info: RepoInfo | null) => void;
}

export default function RepoSelector({ repoInfo, onRepoChange }: Props) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const handleSelect = async () => {
        try {
            const selected = await open({
                directory: true,
                multiple: false,
                recursive: false,
            });

            if (selected) {
                await processPath(selected as string);
            }
        } catch (e) {
            console.error(e);
            toast.error('Failed to open dialog');
        }
    };

    const processPath = async (path: string) => {
        setLoading(true);
        try {
            const info = await invoke<RepoInfo>('check_repo', { path });
            if (!info.is_valid) {
                toast.error(t('toast.notGit'));
                onRepoChange(null);
            } else {
                const authors = await invoke<string[]>('list_authors', { path });
                onRepoChange({ ...info, authors });
                toast.success(t('toast.repoLoaded', { branch: info.branch }));
            }
        } catch (e) {
            toast.error(t('toast.error', { message: String(e) }));
            onRepoChange(null);
        } finally {
            setLoading(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const items = e.dataTransfer.items;
        if (items && items.length > 0) {
            const item = items[0];
            if (item.kind === 'file') {
                const file = item.getAsFile();
                if (file) {
                    // Note: Web drag-drop doesn't give us the full path easily
                    // This would need Tauri-specific handling
                    toast.error('请使用选择按钮选择文件夹');
                }
            }
        }
    };

    return (
        <CollapsiblePanel
            title={t('repo.label')}
            icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
            }
            defaultExpanded={true}
        >
            {repoInfo ? (
                <div className="space-y-3">
                    {/* Repo Path */}
                    <div className="p-3 rounded-lg bg-surface-tertiary border border-border">
                        <div className="font-mono text-xs text-content-secondary break-all mb-2">
                            {repoInfo.path}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="badge badge-success">
                                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {t('repo.valid')}
                            </span>
                            <span className="badge badge-accent">
                                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                {repoInfo.branch}
                            </span>
                        </div>
                    </div>

                    {/* Change Repo Button */}
                    <button
                        onClick={handleSelect}
                        disabled={loading}
                        className="btn-secondary w-full text-sm py-2"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-content-tertiary/30 border-t-content-tertiary rounded-full animate-spin" />
                                分析中...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                {t('repo.change')}
                            </span>
                        )}
                    </button>
                </div>
            ) : (
                <button
                    onClick={handleSelect}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    disabled={loading}
                    className={`
                        w-full h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 
                        transition-all duration-200
                        ${isDragging
                            ? 'border-accent bg-accent/10 scale-[1.02]'
                            : 'border-border hover:border-accent/50 hover:bg-accent/5'
                        }
                        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                >
                    {loading ? (
                        <>
                            <span className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                            <span className="text-sm text-content-secondary">{t('repo.analyzing')}</span>
                        </>
                    ) : (
                        <>
                            <div className={`
                                w-12 h-12 rounded-xl flex items-center justify-center
                                ${isDragging ? 'bg-accent/20' : 'bg-surface-tertiary'}
                                transition-colors
                            `}>
                                <svg className={`w-6 h-6 ${isDragging ? 'text-accent' : 'text-content-tertiary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                            </div>
                            <span className={`text-sm ${isDragging ? 'text-accent' : 'text-content-secondary'}`}>
                                {isDragging ? '释放以选择' : t('repo.select')}
                            </span>
                            <span className="text-xs text-content-tertiary">
                                点击选择 Git 仓库目录
                            </span>
                        </>
                    )}
                </button>
            )}
        </CollapsiblePanel>
    );
}
