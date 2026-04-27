"use client";

import { useEffect, useState } from "react";
import { EyeIcon, PlatformBadge, Toggle } from "./UIForest";
import { getPlatformMeta } from "./Utils";
 import { useAuth } from "@clerk/nextjs";
import { ACTIVATE_DEACTIVATE_APP, SAVE_SETTINGS } from "@/app/constant/baseurl";
import { AppData } from "@/app/constant/constants";

// ─── API Key field labels ─────────────────────────────────────────────────────

const API_KEY_FIELDS = [
    { label: "API Key", placeholder: "Starts with your app key…" },
    { label: "API Secret", placeholder: "Starts with your app secret…" },
    { label: "Access Token", placeholder: "Starts with your access token…" },
    { label: "Access Token Secret", placeholder: "Starts with your token secret…" },
];
 
function SecretInput({
    label,
    placeholder,
    value,
    onChange,
    index,
}: {
    label: string;
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
    index: number;
}) {
    const [visible, setVisible] = useState(false);
    const [focused, setFocused] = useState(false);
    const filled = value.length > 0;

    return (
        <div className="relative group">
            {/* Floating label */}
            <label
                className={`absolute left-3.5 pointer-events-none transition-all duration-150 origin-left z-10 select-none
                    ${focused || filled
                        ? "top-2 text-[10px] font-semibold text-gray-400 dark:text-gray-500 scale-100"
                        : "top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-gray-500"
                    }`}
            >
                {label}
                <span className="text-red-400 ml-0.5">*</span>
            </label>

            {/* Index badge */}
            <span className="absolute left-3.5 bottom-2.5 text-[10px] font-mono text-gray-300 dark:text-gray-600 select-none pointer-events-none">
                {String(index + 1).padStart(2, "0")}
            </span>

            <input
                type={visible ? "text" : "password"}
                value={value}
                onChange={e => onChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder={focused ? placeholder : ""}
                autoComplete="off"
                spellCheck={false}
                className={`w-full pt-6 pb-3 pl-3.5 pr-11 text-sm rounded-xl border bg-white dark:bg-gray-800/60
                    text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600
                    font-mono tracking-wide transition-all duration-150 outline-none
                    ${focused
                        ? "border-gray-900 dark:border-gray-300 shadow-[0_0_0_3px_rgba(0,0,0,0.06)] dark:shadow-[0_0_0_3px_rgba(255,255,255,0.06)]"
                        : filled
                            ? "border-gray-300 dark:border-gray-600"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
            />

            {/* Show/hide toggle */}
            <button
                type="button"
                onClick={() => setVisible(v => !v)}
                tabIndex={-1}
                aria-label={visible ? "Hide key" : "Show key"}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
                <EyeIcon open={visible} />
            </button>

            {/* Filled indicator dot */}
            {filled && (
                <span className="absolute right-10 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500" />
            )}
        </div>
    );
}

// ─── SettingsDrawer ───────────────────────────────────────────────────────────

export function SettingsDrawer({ open, onClose, app }: {
    open: boolean;
    onClose: () => void;
    app?: AppData | null;
}) {

    const [autoPublish, setAutoPublish] = useState(false);
    const [notifications, setNotifications] = useState(false);
    const [apiKeys, setApiKeys] = useState<string[]>(["", "", "", ""]);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hasActivate, setHasActivate] = useState(app?.is_active ?? false);
    
    const [connectAppErrorMessage, setConnectAppErrorMessage] = useState<string | null>(null);

    const { getToken } = useAuth();

    const [token, setToken] = useState<string | null>(null);

    useEffect(() => { getToken().then(t => setToken(t)); }, [getToken]);

    useEffect(() => {
        if (app) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setAutoPublish(app.auto_publish_post ?? false);
            setNotifications(app.failure_notification ?? false);
            if (app.credentials) {
                try {
                    const creds = JSON.parse(app.credentials);
                    setApiKeys([
                        creds.api_key || "",
                        creds.api_secret || "",
                        creds.access_token || "",
                        creds.access_token_secret || "",
                    ]);
                } catch (e) {
                    console.error("Failed to parse credentials:", e);
                }
            } else {
                setApiKeys(["", "", "", ""]);
            }
        }
    }, [app]);

    const handleApiKeyChange = (idx: number, value: string) => {
        setApiKeys(keys => {
            const next = [...keys];
            next[idx] = value;
            return next;
        });
    };

    const handleAppActive = async () => {
        setLoading(true);
        try {
            // const token = await getToken();
            const res = await fetch(ACTIVATE_DEACTIVATE_APP(app!.id.toString()),  {
                method: "POST",
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), },
            });
            if (!res.ok) throw new Error((await res.json()).message || "Failed to change app status");
            // Optionally, you can check the response for the new state
            setHasActivate(prev => !prev);
            // setTimeout(() => { onClose(); }, 800);
        } catch (error) {
            setConnectAppErrorMessage(error instanceof Error ? error.message : "Failed to activate/deactivate app");
        } finally {
            setLoading(false);
        }
    }

    const handleSaveSettings = async () => {
        setSaving(true);
        setSaveError(null);
        setSaved(false);

        const apiKeysPayload = {
            api_key: apiKeys[0],
            api_secret: apiKeys[1],
            access_token: apiKeys[2],
            access_token_secret: apiKeys[3],
        }
        try {

            const token = await getToken();
            const res = await fetch(SAVE_SETTINGS(app!.id.toString()), {
                method: "POST",
                headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                body: JSON.stringify({ api_keys: apiKeysPayload, auto_publish: autoPublish, failure_notification: notifications }),
            });
            if (!res.ok) throw new Error("Failed to save settings");
            setSaved(true);
            setTimeout(() => { setSaved(false); onClose(); }, 800);
        } catch (e) {
            setSaveError(e instanceof Error ? e.message : "Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    if (!open || !app) return null;
    const meta = getPlatformMeta(app.platform);
    const filledCount = apiKeys.filter(k => k.trim().length > 0).length;

    return (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

            <div
                className="relative z-10 w-full max-w-sm bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col border-l border-gray-200 dark:border-gray-800 overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 shrink-0">
                    <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">App Settings</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{app.name} · {meta.label}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-lg leading-none"
                    >×</button>
                </div>

                <div className="flex flex-col gap-6 p-6 flex-1">

                    {/* App card */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 flex items-center gap-3">
                        <PlatformBadge platform={app.platform} size="md" />
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{app.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{app.platform_username ?? meta.label}</p>
                        </div>
                        <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium shrink-0">
                            <span className={`w-1.5 h-1.5 rounded-full ${app.is_active ? "bg-emerald-500" : "bg-gray-400"}`} />{app.is_active ? "Active" : "Inactive"}
                        </span>
                    </div>

                    {/* Publishing toggles */}
                    <div>
                        <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Publishing</p>
                        <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
                            {[
                                {
                                    label: "Auto-publish scheduled posts",
                                    sub: "Posts go live automatically at the scheduled time",
                                    val: autoPublish,
                                    set: setAutoPublish,
                                },
                                // {
                                //     label: "Failure notifications",
                                //     sub: "Get notified when a post fails to publish",
                                //     val: notifications,
                                //     set: setNotifications,
                                // },
                            ].map(item => (
                                <div key={item.label} className="flex items-start gap-3 px-4 py-3.5 bg-white dark:bg-gray-900/50">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{item.sub}</p>
                                    </div>
                                    <Toggle value={item.val} onChange={item.set} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* API Keys section */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                {meta.label} API Keys
                            </p>
                            {/* Progress pill */}
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-colors
                                ${filledCount === 4
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-400"
                                    : "bg-gray-50 border-gray-200 text-gray-400 dark:bg-gray-800 dark:border-gray-700"
                                }`}
                            >
                                {filledCount}/4
                            </span>
                        </div>

                        <div className="space-y-2.5">
                            {API_KEY_FIELDS.map((field, i) => (
                                <SecretInput
                                    key={field.label}
                                    index={i}
                                    label={field.label}
                                    placeholder={field.placeholder}
                                    value={apiKeys[i] ?? ""}
                                    onChange={v => handleApiKeyChange(i, v)}
                                />
                            ))}
                        </div>

                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 leading-relaxed">
                            Keys are encrypted and stored securely. They are never exposed in responses.
                        </p>
                    </div>

                    {/* Danger zone */}
                    {/* Danger zone */}
                    <div>
                        <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                            Danger zone
                        </p>

                        
                        {connectAppErrorMessage && (
                            <p className="text-xs text-red-500 dark:text-red-400 mb-3">{connectAppErrorMessage}</p>
                        )}
                        <button
                            disabled={saving || loading}
                            onClick={handleAppActive}
                            className={`w-full text-sm py-2.5 px-4 rounded-xl border font-medium
            flex items-center justify-center gap-2 transition-all duration-150
            disabled:opacity-60 disabled:cursor-not-allowed
            ${hasActivate
                                    ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950 hover:border-red-300 dark:hover:border-red-700"
                                    : "border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-950 hover:border-teal-300 dark:hover:border-teal-700"
                                }`}
                        >
                            {loading ? (
                                <>
                                    <svg
                                        width="15" height="15" viewBox="0 0 15 15" fill="none"
                                        className="animate-spin shrink-0"
                                    >
                                        <circle
                                            cx="7.5" cy="7.5" r="5.5"
                                            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                                            strokeDasharray="26" strokeDashoffset="9"
                                        />
                                    </svg>
                                    Loading…
                                </>
                            ) : hasActivate ? (
                                <>
                                    {/* X-circle icon — disconnect */}
                                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0">
                                        <path d="M5.5 5.5L9.5 9.5M9.5 5.5L5.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                        <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.2" />
                                    </svg>
                                    Disconnect {app.name}
                                </>
                            ) : (
                                <>
                                    {/* Check-circle icon — connect */}
                                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0">
                                        <path d="M4 7.5L6.5 10L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.2" />
                                    </svg>
                                    Connect {app.name}
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-5 border-t border-gray-100 dark:border-gray-800 shrink-0 space-y-3">
                    {saveError && (
                        <p className="text-xs text-red-500 dark:text-red-400 text-center">{saveError}</p>
                    )}
                    <button
                        onClick={handleSaveSettings}
                        disabled={saving || loading}
                        className={`w-full py-2.5 text-sm font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2
                            ${saved
                                ? "bg-emerald-600 text-white"
                                : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-100 disabled:opacity-60"
                            }`}
                    >
                        {saving ? (
                            <>
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="animate-spin">
                                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="28" strokeDashoffset="10" />
                                </svg>
                                Saving…
                            </>
                        ) : saved ? (
                            <>
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Saved
                            </>
                        ) : "Save settings"}
                    </button>
                </div>
            </div>
        </div>
    );
}