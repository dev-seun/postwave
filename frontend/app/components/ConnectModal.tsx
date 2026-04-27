"use client";

import { useState } from "react";
import { Platform, PLATFORMS } from "../constant/constants";



export function PlatformBadge({
    platform,
    size = "md",
}: {
    platform: Platform;
    size?: "sm" | "md";
}) {
    return (
        <div
            className={`flex items-center justify-center border font-medium tracking-wide text-xs shrink-0
        ${platform.color}
        ${size === "md" ? "w-10 h-10 rounded-xl" : "w-9 h-9 rounded-lg"}`}
        >
            {platform.abbr}
        </div>
    );
}

export function ConnectModal({
    open,
    onClose,
    onConnect, 
}: {
    open: boolean;
    onClose: () => void;
    onConnect: (app: string, id: string) => void;
    connected: Platform[];
}) {

    const [appName, setAppName] = useState("");
    const [touched, setTouched] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);
    const isAppNameValid = appName.trim().length >= 3;
    // Show all platforms, allow multiple apps per platform
    const available = PLATFORMS;

    // Reset state when modal closes
    if (!open) {
        if (appName !== "" || touched || selectedPlatform !== null) {
            setAppName("");
            setTouched(false);
            setSelectedPlatform(null);
        }
        return null;
    }

    // Helper to check if a platform is selectable
    const isPlatformSelectable = (p: Platform) => p.status === 'available';

    return (
        <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                        Connect an account
                    </p>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        ×
                    </button>
                </div>

                <div className="p-3 pb-0 max-h-80 overflow-y-auto">
                    <div className="mb-4">
                        <label htmlFor="appName" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            App Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="appName"
                            type="text"
                            value={appName}
                            minLength={3}
                            maxLength={20}
                            onChange={e => { setAppName(e.target.value.slice(0, 20)); setTouched(true); }}
                            onBlur={() => setTouched(true)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter app name (max 20 chars)"
                        />
                        {touched && appName.trim().length > 0 && appName.trim().length < 3 && (
                            <span className="text-xs text-red-500">App name must be at least 3 characters.</span>
                        )}
                        {touched && appName.length > 20 && (
                            <span className="text-xs text-red-500">App name must be at most 20 characters.</span>
                        )}
                        {touched && !appName && (
                            <span className="text-xs text-red-500">App name is required.</span>
                        )}
                    </div>
                    {available.length < 1 ? (
                        <p className="text-center text-sm text-gray-400 py-8">
                            All platforms connected!
                        </p>
                    ) : (
                        <div className="space-y-1.5 mb-4">
                            {available.map((p) => {
                                const isSelected = selectedPlatform === p.id;
                                const selectable = isPlatformSelectable(p) && isAppNameValid;
                                return (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => selectable && setSelectedPlatform(p.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors text-left
                                            ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' : 'border-gray-100 dark:border-gray-800'}
                                            ${selectable ? 'hover:bg-gray-50 dark:hover:bg-gray-800' : 'opacity-50 cursor-not-allowed'}`}
                                        disabled={!selectable}
                                    >
                                        <PlatformBadge platform={{ ...p } as Platform} size="sm" />
                                        <p className="text-sm font-medium text-gray-900 dark:text-white flex-1">
                                            {p.name}
                                            {!isPlatformSelectable(p) && (
                                                <span className="ml-2 text-xs text-gray-400 font-normal">(Coming soon)</span>
                                            )}
                                        </p>
                                        {isSelected ? (
                                            <span className="text-blue-500 text-lg font-bold">✓</span>
                                        ) : (
                                            <span className="text-lg text-gray-300 dark:text-gray-600 leading-none">+</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
                {/* Always visible Create button */}
                <div className="px-3 pb-3 pt-2 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <button
                        type="button"
                        className={`w-full py-2.5 rounded-xl font-semibold text-white transition-colors ${selectedPlatform && isAppNameValid && !creating ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                        disabled={!selectedPlatform || !isAppNameValid || creating}
                        onClick={async () => {
                            if (!selectedPlatform || !isAppNameValid) return;
                            setCreating(true);
                            try {
                                await onConnect(selectedPlatform, appName);
                            } finally {
                                setCreating(false);
                            }
                        }}
                    >
                        {creating ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </div>
        </div>
    );
}