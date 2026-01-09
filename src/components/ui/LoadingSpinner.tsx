interface Props {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export default function LoadingSpinner({ size = 'md', className = '' }: Props) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };

    return (
        <div className={`relative ${sizeClasses[size]} ${className}`}>
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-2 border-accent/20" />

            {/* Spinning gradient ring */}
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent animate-spin" />

            {/* Inner glow */}
            <div className="absolute inset-1 rounded-full bg-accent/10 animate-pulse" />
        </div>
    );
}
