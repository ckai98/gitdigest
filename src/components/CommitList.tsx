import React from 'react';
import { CommitSummary } from '../types';
import { format } from 'date-fns';

interface Props {
    commits: CommitSummary[];
}

const CommitList: React.FC<Props> = ({ commits }) => {
    if (commits.length === 0) {
        return (
            <div className="text-center py-8 text-content-tertiary">
                <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm">无提交记录</p>
            </div>
        );
    }

    return (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
            {commits.map((commit, index) => (
                <div
                    key={commit.hash}
                    className="relative pl-4 py-2 rounded-lg hover:bg-surface-tertiary/50 transition-all duration-200 group cursor-default animate-fade-in"
                    style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
                >
                    {/* Left accent bar */}
                    <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-border group-hover:bg-accent transition-colors rounded-full" />

                    <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-mono text-content-tertiary bg-surface-tertiary px-1.5 py-0.5 rounded">
                            {commit.hash.substring(0, 7)}
                        </span>
                        <span className="text-[10px] text-content-tertiary">
                            {format(new Date(commit.date), 'MM-dd HH:mm')}
                        </span>
                    </div>

                    <p className="text-xs text-content-primary font-medium line-clamp-2 mb-1" title={commit.message}>
                        {commit.message.split('\n')[0]}
                    </p>

                    <div className="flex items-center gap-1 text-[10px] text-content-tertiary">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="truncate max-w-[120px]">{commit.author}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CommitList;
