import { Report } from '../types';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
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
        <div className="glass-card overflow-hidden min-h-[600px] flex flex-col animate-fade-in">
            {/* Header */}
            <div className="border-b border-border p-4 flex justify-between items-center bg-surface-tertiary/30">
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('report')}
                        className={`
                            px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                            ${activeTab === 'report'
                                ? 'bg-accent/15 text-accent'
                                : 'text-content-secondary hover:bg-surface-tertiary hover:text-content-primary'
                            }
                        `}
                    >
                        <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {t('report.tabReport')}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('commits')}
                        className={`
                            px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                            ${activeTab === 'commits'
                                ? 'bg-accent/15 text-accent'
                                : 'text-content-secondary hover:bg-surface-tertiary hover:text-content-primary'
                            }
                        `}
                    >
                        <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            {t('report.tabCommits')} ({report.commits.length})
                        </span>
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs text-content-tertiary">
                        <span className="badge badge-accent">
                            {report.model_used}
                        </span>
                        <span>{report.word_count} {t('report.chars')}</span>
                    </div>
                    <button
                        onClick={handleCopy}
                        className="btn-primary text-xs py-2 px-3"
                    >
                        <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            {t('report.copy')}
                        </span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                {activeTab === 'report' ? (
                    <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-content-primary prose-p:text-content-secondary prose-strong:text-content-primary prose-code:text-accent prose-code:bg-surface-tertiary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-surface-tertiary prose-pre:border prose-pre:border-border prose-a:text-accent prose-a:no-underline hover:prose-a:underline">
                        <ReactMarkdown>{report.summary}</ReactMarkdown>
                    </article>
                ) : (
                    <div className="space-y-3">
                        {report.commits.map((c, index) => (
                            <div
                                key={c.hash}
                                className="relative pl-6 py-3 hover:bg-surface-tertiary/50 rounded-lg transition-colors group"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {/* Timeline line */}
                                <div className="absolute left-2 top-0 bottom-0 w-px bg-border group-hover:bg-accent/30 transition-colors" />

                                {/* Timeline dot */}
                                <div className="absolute left-0.5 top-4 w-3 h-3 rounded-full bg-surface-tertiary border-2 border-border group-hover:border-accent group-hover:bg-accent/20 transition-colors" />

                                <div className="flex justify-between items-baseline mb-1.5">
                                    <span className="font-mono text-xs px-2 py-0.5 bg-surface-tertiary rounded text-content-tertiary">
                                        {c.hash.substring(0, 7)}
                                    </span>
                                    <span className="text-xs text-content-tertiary">
                                        {new Date(c.date).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="font-medium text-content-primary text-sm mb-1">
                                    {c.message}
                                </div>
                                <div className="text-xs text-content-tertiary flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    {c.author}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
