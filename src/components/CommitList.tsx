import React from 'react';
import { CommitSummary } from '../types';
import { format } from 'date-fns';

interface Props {
    commits: CommitSummary[];
}

const CommitList: React.FC<Props> = ({ commits }) => {
    if (commits.length === 0) {
        return (
            <div className="text-center p-8 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                无提交记录
            </div>
        );
    }

    return (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {commits.map((commit) => (
                <div
                    key={commit.hash}
                    className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">
                            {commit.hash.substring(0, 7)}
                        </span>
                        <span className="text-xs text-slate-500">
                            {format(new Date(commit.date), 'yyyy-MM-dd HH:mm')}
                        </span>
                    </div>
                    <p className="text-slate-800 font-medium mb-1 line-clamp-2" title={commit.message}>
                        {commit.message.split('\n')[0]}
                    </p>
                    <div className="flex justify-between items-center text-xs text-slate-500 mt-2">
                        <span className="flex items-center gap-1">
                            👤 {commit.author}
                        </span>
                        {/* Placeholder for future diff stats integration if implemented on backend properly */}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CommitList;
