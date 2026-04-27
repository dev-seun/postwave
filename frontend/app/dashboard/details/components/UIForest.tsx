"use client";

import { PostStatus, STATUS_STYLES, STATUS_DOT, AppData } from "@/app/constant/constants";
import { fmt, getPlatformMeta } from "./Utils";

export function Spinner({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className="animate-spin text-gray-400">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                strokeDasharray="28" strokeDashoffset="10" />
        </svg>
    );
}


export function StatusBadge({ status }: { status: PostStatus }) {
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium ${STATUS_STYLES[status]}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[status]}`} />
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}


export function PlatformBadge({ platform, size = "sm" }: { platform: string; size?: "sm" | "md" }) {
    const meta = getPlatformMeta(platform);
    const dim = size === "md" ? "w-9 h-9 text-xs" : "w-7 h-7 text-xs";
    return (
        <div className={`${dim} rounded-xl flex items-center justify-center border font-semibold shrink-0 ${meta.color}`}>
            {meta.abbr}
        </div>
    );
}

export function ErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
    return (
        <div className="mb-5 flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-300">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                <line x1="8" y1="5" x2="8" y2="8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="8" cy="11" r="0.75" fill="currentColor" />
            </svg>
            <span className="flex-1">{message}</span>
            <button onClick={onDismiss} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
        </div>
    );
}

export function InlineError({ message }: { message: string }) {
    return (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="shrink-0">
                <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.3" />
                <line x1="6.5" y1="4" x2="6.5" y2="7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                <circle cx="6.5" cy="9" r="0.6" fill="currentColor" />
            </svg>
            {message}
        </div>
    );
}

export function Toast({ message, type }: { message: string; type: "success" | "error" }) {
    return (
        <div className={`fixed bottom-6 right-6 z-[60] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium
            ${type === "success"
                ? "bg-white dark:bg-gray-900 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                : "bg-white dark:bg-gray-900 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"}`}
        >
            <span className={`w-2 h-2 rounded-full shrink-0 ${type === "success" ? "bg-emerald-500" : "bg-red-500"}`} />
            {message}
        </div>
    );
}

export function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            onClick={() => onChange(!value)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors
                ${value ? "bg-gray-900 dark:bg-white" : "bg-gray-200 dark:bg-gray-700"}`}
        >
            <span className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white dark:bg-gray-900 shadow transform transition-transform
                ${value ? "translate-x-4" : "translate-x-0.5"}`} />
        </button>
    );
}

export function ModalWrapper({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}



export function ModalHeader({ title, subtitle, onClose, right }: {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    onClose: () => void;
    right?: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
                {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2.5">
                {right}
                <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-lg leading-none">×</button>
            </div>
        </div>
    );
}

export function ModalFooter({ left, right }: { left?: React.ReactNode; right?: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-2 px-5 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
            <div>{left}</div>
            <div className="flex items-center gap-2">{right}</div>
        </div>
    );
}

export function TabBar<T extends string>({ tabs, active, onChange }: {
    tabs: { id: T; label: string }[];
    active: T;
    onChange: (id: T) => void;
}) {
    return (
        <div className="flex items-center gap-1 px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 shrink-0">
            {tabs.map(t => (
                <button
                    key={t.id}
                    onClick={() => onChange(t.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                        ${active === t.id
                            ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                            : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                >{t.label}</button>
            ))}
        </div>
    );
}

export function PrimaryButton({ onClick, disabled, busy, children }: {
    onClick: () => void;
    disabled?: boolean;
    busy?: boolean;
    children: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled || busy}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
            {busy && <Spinner size={14} />}
            {children}
        </button>
    );
}

export function GhostButton({ onClick, disabled, children, className = "" }: {
    onClick: () => void;
    disabled?: boolean;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`px-4 py-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 ${className}`}
        >
            {children}
        </button>
    );
}

export function DangerButton({ onClick, disabled, children }: {
    onClick: () => void;
    disabled?: boolean;
    children: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="px-4 py-2 text-sm text-red-500 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-950 transition-colors disabled:opacity-50"
        >
            {children}
        </button>
    );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
        <label className="block text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
            {children}
        </label>
    );
}

export function Textarea({ value, onChange, rows = 6, maxLength, placeholder }: {
    value: string;
    onChange: (v: string) => void;
    rows?: number;
    maxLength?: number;
    placeholder?: string;
}) {
    return (
        <div>
            <textarea
                rows={rows}
                value={value}
                onChange={e => onChange(e.target.value)}
                maxLength={maxLength}
                placeholder={placeholder}
                className="w-full text-sm px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/10 transition leading-relaxed"
            />
            {maxLength && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 text-right">{value.length}/{maxLength}</p>
            )}
        </div>
    );
}


export function PageSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 animate-pulse">
                        <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-800 mb-4" />
                        <div className="h-7 w-24 rounded bg-gray-100 dark:bg-gray-800" />
                    </div>
                ))}
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden animate-pulse">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="h-4 w-16 rounded bg-gray-100 dark:bg-gray-800" />
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="px-5 py-4 border-b border-gray-50 dark:border-gray-800 flex gap-6">
                        <div className="h-3 flex-1 rounded bg-gray-50 dark:bg-gray-800" />
                        <div className="h-3 w-16 rounded bg-gray-50 dark:bg-gray-800" />
                        <div className="h-3 w-20 rounded bg-gray-50 dark:bg-gray-800" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function MetricsGrid({ app }: { app: AppData }) {
    const meta = getPlatformMeta(app.platform);
    const metrics = [
        { label: "Followers", value: fmt(app.followers) },
        { label: "Total Posts", value: fmt(app.posts) },
        { label: "Avg. Engagement", value: fmt(app.engagements) },
        { label: "Platform", value: meta.label },
    ];
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {metrics.map(m => (
                <div key={m.label} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{m.label}</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">{m.value}</p>
                </div>
            ))}
        </div>
    );
}


export function EyeIcon({ open }: { open: boolean }) {
    return open ? (
        // Eye open
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-400">
            <ellipse cx="8" cy="8" rx="6.5" ry="4" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
        </svg>
    ) : (
        // Eye closed
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-400">
            <path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M6.5 5.5A6.5 4 0 0 1 14.5 8c-.5 1-1.5 2-2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M4 6.5C2.8 7.1 1.8 7.6 1.5 8a6.5 4 0 0 0 4 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
    );
}
