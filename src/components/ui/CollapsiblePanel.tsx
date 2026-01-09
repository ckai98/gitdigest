import { useState, ReactNode } from 'react';

interface Props {
    title: string;
    icon?: ReactNode;
    defaultExpanded?: boolean;
    children: ReactNode;
    badge?: ReactNode;
}

export default function CollapsiblePanel({
    title,
    icon,
    defaultExpanded = true,
    children,
    badge
}: Props) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div className="glass-card overflow-hidden transition-theme">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-tertiary/50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    {icon && (
                        <span className="text-accent text-lg">{icon}</span>
                    )}
                    <span className="font-semibold text-content-primary text-sm">
                        {title}
                    </span>
                    {badge && (
                        <span className="ml-2">{badge}</span>
                    )}
                </div>

                {/* Chevron */}
                <svg
                    className={`w-4 h-4 text-content-tertiary transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''
                        }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {/* Content */}
            <div
                className={`overflow-hidden transition-all duration-300 ease-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="px-4 pb-4 pt-1">
                    {children}
                </div>
            </div>
        </div>
    );
}
