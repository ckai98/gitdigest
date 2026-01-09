import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative w-10 h-10 rounded-lg bg-surface-tertiary hover:bg-surface-elevated border border-border hover:border-border-hover flex items-center justify-center transition-all duration-200 group"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            {/* Sun Icon */}
            <svg
                className={`w-5 h-5 absolute transition-all duration-300 ${theme === 'dark'
                        ? 'opacity-0 rotate-90 scale-0'
                        : 'opacity-100 rotate-0 scale-100 text-amber-500'
                    }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
            </svg>

            {/* Moon Icon */}
            <svg
                className={`w-5 h-5 absolute transition-all duration-300 ${theme === 'dark'
                        ? 'opacity-100 rotate-0 scale-100 text-cyan-400'
                        : 'opacity-0 -rotate-90 scale-0'
                    }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
            </svg>

            {/* Hover glow effect */}
            <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${theme === 'dark'
                    ? 'bg-cyan-500/10'
                    : 'bg-amber-500/10'
                }`} />
        </button>
    );
}
