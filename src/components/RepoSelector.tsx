import { open } from '@tauri-apps/plugin-dialog';
import { RepoInfo } from '../types';
import { invoke } from '@tauri-apps/api/core';
import { useState } from 'react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface Props {
    repoInfo: RepoInfo | null;
    onRepoChange: (info: RepoInfo | null) => void;
}

export default function RepoSelector({ repoInfo, onRepoChange }: Props) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    const handleSelect = async () => {
        try {
            const selected = await open({
                directory: true,
                multiple: false,
                recursive: false,
            });

            if (selected) {
                setLoading(true);
                const path = selected as string;

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
            }
        } catch (e) {
            console.error(e);
            toast.error('Failed to open dialog');
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span>📁</span> {t('repo.label')}
            </h2>

            <div className="space-y-4">
                {repoInfo ? (
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="font-mono text-sm text-slate-600 break-all mb-2">
                            {repoInfo.path}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                {t('repo.valid')}
                            </span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                {repoInfo.branch}
                            </span>
                            <button
                                onClick={handleSelect}
                                className="ml-auto text-xs text-blue-600 hover:text-blue-800 underline"
                            >
                                {t('repo.change')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={handleSelect}
                        disabled={loading}
                        className={clsx(
                            "w-full h-32 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-blue-500 hover:text-blue-500 transition-colors",
                            loading && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <span className="text-4xl">📂</span>
                        <span>{loading ? t('repo.analyzing') : t('repo.select')}</span>
                    </button>
                )}
            </div>
        </div>
    );
}
