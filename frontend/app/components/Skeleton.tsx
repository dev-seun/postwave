
"use client";

export function Skeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <div
                    key={i}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 flex flex-col gap-4 animate-pulse"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800" />
                        <div className="flex flex-col gap-1.5 flex-1">
                            <div className="h-3.5 w-24 rounded bg-gray-100 dark:bg-gray-800" />
                            <div className="h-3 w-16 rounded bg-gray-100 dark:bg-gray-800" />
                        </div>
                    </div>
                    <div className="h-16 rounded-xl bg-gray-50 dark:bg-gray-800" />
                    <div className="h-9 rounded-xl bg-gray-50 dark:bg-gray-800" />
                </div>
            ))}
        </div>
    );
}