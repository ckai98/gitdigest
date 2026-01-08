import { Report } from '../types';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
    report: Report;
}

export default function ReportViewer({ report }: Props) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'report' | 'commits'>('report');

    const handleCopy = () => {
        navigator.clipboard.writeText(report.summary);
        toast.success(t('report.copied'));
    };

    return (
        <div className="bg-white rounded-xl shadow-xl overflow-hidden min-h-[600px] flex flex-col">
            <div className="border-b border-gray-100 p-4 flex justify-between items-center bg-gray-50/50">
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('report')}
                        className={clsx(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                            activeTab === 'report' ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
                        )}
                    >
                        {t('report.tabReport')}
                    </button>
                    <button
                        onClick={() => setActiveTab('commits')}
                        className={clsx(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                            activeTab === 'commits' ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
                        )}
                    >
                        {t('report.tabCommits')} ({report.commits.length})
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                        {t('report.generatedBy')} {report.model_used} • {report.word_count} {t('report.chars')}
                    </span>
                    <button
                        onClick={handleCopy}
                        className="px-3 py-1.5 bg-gray-900 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                    >
                        {t('report.copy')}
                    </button>
                </div>
            </div>

            <div className="p-8 overflow-y-auto flex-1 h-[calc(100vh-200px)]">
                {activeTab === 'report' ? (
                    <article className="prose prose-slate max-w-none prose-headings:text-slate-800 prose-p:text-slate-600">
                        <ReactMarkdown>{report.summary}</ReactMarkdown>
                    </article>
                ) : (
                    <div className="space-y-4">
                        {report.commits.map((c) => (
                            <div key={c.hash} className="border-l-2 border-slate-200 pl-4 py-1 hover:border-blue-400 transition-colors">
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="font-mono text-xs text-slate-400">{c.hash.substring(0, 7)}</span>
                                    <span className="text-xs text-slate-500">{new Date(c.date).toLocaleDateString()}</span>
                                </div>
                                <div className="font-medium text-slate-800">{c.message}</div>
                                <div className="text-xs text-slate-500 mt-0.5">{c.author}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
