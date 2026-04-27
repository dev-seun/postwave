"use client";

import { useUser, useAuth, UserButton } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { AppCard } from "../components/Card";
import { ConnectModal } from "../components/ConnectModal";
import { EmptyState } from "../components/EmptyAppState";
import { Skeleton } from "../components/Skeleton";
import { APP_LIST, CREATE_APP, DELETE_APP } from "../constant/baseurl";
import { Platform, AppRecord, PLATFORMS } from "../constant/constants";

 
 
 
export default function DashboardPage() {
    const { user } = useUser();
    const { getToken } = useAuth(); 

    const [connected, setConnected] = useState<Platform[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const fetchApps = async () => {
        try {
            const token = await getToken();
            // console.log('Token:', token);
            const res = await fetch(APP_LIST, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            if (!res.ok) throw new Error(`Request failed with status ${res.status}`);

            const data = await res.json();
            // console.log('First record:', data);
            const mapped = data.data
                .map((record: AppRecord) => {
                    // Find the platform base info using the first platform ID in the array
                    const base = PLATFORMS.find((p) => p.id === record.platform);

                    if (!base) return null;

                    return {
                        ...base,
                        app_id: record.id,
                        handle: record.platform_username ?? base.handle,
                        platform_username: record.platform_username ?? "",
                        stat: {
                            followers: record.followers.toString(),
                            posts: record.posts,
                            engagement: record.engagements.toString(),
                        }
                    } as unknown as AppRecord;
                })
                .filter((p: unknown): p is Platform => p !== null);
                // console.log(mapped, '-------')
            setConnected(mapped);
        } catch (err) {
            console.error(err);
            setError("Could not load your connected apps. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const apps = async () => {
            await fetchApps();
        };
        apps();
    }, [getToken]);

    const createApp = async (appName: string, platformId: string) => {
        try {
            const token = await getToken(); 
            const res = await fetch(CREATE_APP, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ name: appName, platforms: platformId }),
            });
            
            const data = await res.json();
            // console.log(data)
            if (!res.ok) throw new Error(data.message || `Request failed with status ${res.status}`);
            
            // console.log('First record:', data);
            await fetchApps();
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async (id: string, appName: string) => {
        await createApp(appName, id);
        setModalOpen(false);
    };

    const handleRemove = async (id: string) => { 
        try {
            const token = await getToken();
            const res = await fetch(DELETE_APP(id), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                }, 
            });

            const data = await res.json();
            // console.log(data)
            if (!res.ok) throw new Error(data.message || `Request failed with status ${res.status}`);

            // console.log('First record:', data);
            await fetchApps();
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const greeting = user?.firstName
        ? `Welcome back, ${user.firstName}`
        : "Welcome back";

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

            {/* ── Navbar ── */}
            <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">

                    {/* Brand */}
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center shrink-0">
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 14 14"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="text-white dark:text-gray-900"
                            >
                                <path
                                    d="M1.5 9.5 Q3.5 3.5 7 7 Q10.5 10.5 12.5 4"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white tracking-tight">
                            PostWave
                        </span>
                    </div>

                    {/* Clerk user button */}
                    <UserButton
                        afterSwitchSessionUrl="/sign-in"
                        appearance={{
                            elements: {
                                avatarBox: "w-8 h-8",
                            },
                        }}
                    />
                </div>
            </header>

            {/* ── Main ── */}
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Page header row */}
                <div className="flex items-start justify-between pb-6 mb-6 border-b border-gray-200 dark:border-gray-800">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
                            Social hub
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {loading
                                ? "Loading your accounts…"
                                : connected.length === 0
                                    ? `${greeting} — no accounts connected yet`
                                    : `${greeting} · ${connected.length} account${connected.length > 1 ? "s" : ""} connected`}
                        </p>
                    </div>

                    {!loading && (
                        <button
                            onClick={() => setModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-xl hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors shrink-0"
                        >
                            <span className="text-base leading-none">+</span>
                            Connect account
                        </button>
                    )}
                </div>

                {/* Error banner */}
                {error && (
                    <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-300">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                            <line x1="8" y1="5" x2="8" y2="8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <circle cx="8" cy="11" r="0.75" fill="currentColor" />
                        </svg>
                        {error}
                        <button
                            onClick={() => setError(null)}
                            className="ml-auto text-red-400 hover:text-red-600 dark:hover:text-red-200 leading-none"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Content area */}
                {loading ? (
                    <Skeleton />
                ) : connected.length === 0 ? (
                    <EmptyState onConnect={() => setModalOpen(true)} />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {connected.map((platform) => (
                            <AppCard
                                key={platform.app_id}
                                platform={platform} 
                                onRemove={() => handleRemove(platform.app_id.toString())}
                            />
                        ))}

                        {/* Ghost add tile */}
                        <button
                            onClick={() => setModalOpen(true)}
                            className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 min-h-[180px] text-gray-400 dark:text-gray-600 hover:border-gray-300 dark:hover:border-gray-700 hover:text-gray-500 dark:hover:text-gray-500 transition-colors"
                        >
                            <span className="text-2xl leading-none">+</span>
                            <span className="text-sm">Add account</span>
                        </button>
                    </div>
                )}
            </main>

            {/* Connect modal */}
            <ConnectModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onConnect={handleConnect}
                connected={connected}
            />
        </div>
    );
}