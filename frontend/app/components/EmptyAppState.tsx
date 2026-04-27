
"use client";

export function EmptyState({ onConnect }: { onConnect: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[420px] text-center gap-5 px-4">
            <svg
                width="88"
                height="88"
                viewBox="0 0 88 88"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-gray-300 dark:text-gray-600"
            >
                <rect x="4" y="4" width="24" height="24" rx="6" stroke="currentColor" strokeWidth="1.5" />
                <rect x="60" y="4" width="24" height="24" rx="6" stroke="currentColor" strokeWidth="1.5" />
                <rect x="4" y="60" width="24" height="24" rx="6" stroke="currentColor" strokeWidth="1.5" />
                <rect x="60" y="60" width="24" height="24" rx="6" stroke="currentColor" strokeWidth="1.5" />
                <rect x="32" y="32" width="24" height="24" rx="6" stroke="currentColor" strokeWidth="1.5" />
                <line x1="28" y1="16" x2="60" y2="16" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="28" y1="72" x2="60" y2="72" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="16" y1="28" x2="35" y2="40" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="72" y1="28" x2="53" y2="40" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="16" y1="60" x2="35" y2="48" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="72" y1="60" x2="53" y2="48" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="44" y1="32" x2="44" y2="28" stroke="currentColor" strokeWidth="1.5" />
                <line x1="41" y1="30" x2="47" y2="30" stroke="currentColor" strokeWidth="1.5" />
            </svg>

            <div className="space-y-2">
                <p className="text-base font-medium text-gray-900 dark:text-white">
                    No accounts connected yet
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                    Connect your social accounts to schedule posts, track engagement, and
                    publish everywhere from one place.
                </p>
            </div>

            <button
                onClick={onConnect}
                className="mt-1 px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-xl hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors"
            >
                Connect your first account
            </button>
        </div>
    );
}