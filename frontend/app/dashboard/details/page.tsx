/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Suspense } from 'react'
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link"; 
import { GeneratePostModal } from "./components/GeneratePost";
import { PostsTable } from "./components/PostTable";
import { SettingsDrawer } from "./components/SettingsDrawer";
import { PostModal } from "./components/PostModal";
import { PlatformBadge, ErrorBanner, PageSkeleton, MetricsGrid, Toast } from "./components/UIForest";
import { getPlatformMeta, fmtDate } from "./components/Utils";
import { API } from '@/app/constant/baseurl';
import { AppData, PostsData, FilterValue, PostItem, AppDetailResponse, LIMIT, PostsResponse } from '@/app/constant/constants';

// ─── Centralized API Endpoints ────────────────────────────────────────────────
// Update BASE_URL to match your backend


export default function AppDetailPage() {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <AppDetailContent />
        </Suspense>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

 function AppDetailContent() {
    // const { appId } = useParams<{ appId: string }>();
    const searchParams = useSearchParams();
    const appId: string = searchParams.get("appId") ??  '';

    const { getToken } = useAuth();

    const [token, setToken] = useState<string | null>(null);
    const [app, setApp] = useState<AppData | null>(null);
    const [postsData, setPostsData] = useState<PostsData | null>(null);
    const [appLoading, setAppLoading] = useState(true);
    const [postsLoading, setPostsLoading] = useState(false);
    const [pageError, setPageError] = useState<string | null>(null);
    const [filter, setFilter] = useState<FilterValue>("all");
    const [page, setPage] = useState(1);
    const [selectedPost, setSelectedPost] = useState<PostItem | null>(null);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [generateOpen, setGenerateOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    useEffect(() => { getToken().then(t => setToken(t)); }, [getToken]);

    const authHeaders = useCallback((): HeadersInit => ({
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }), [token]);

    // Fetch app details
   
    const fetchAppDetails = async () => {
         
        try {
            const res = await fetch(API.APP_DETAILS(appId), { headers: authHeaders() });
            const json: AppDetailResponse = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message);
            setApp(json.data);
        } catch (e) {
            setPageError(e instanceof Error ? e.message : "Failed to load app details.");
        } finally {
            setAppLoading(false);
        }

    }

    useEffect(() => {
        if (!appId) return;
        fetchAppDetails();
    }, [appId, authHeaders]);

    // Fetch posts
    const fetchPosts = useCallback(async (currentPage: number, currentFilter: FilterValue) => {
        if (!appId) return;
        setPostsLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(currentPage),
                limit: String(LIMIT),
                ...(currentFilter !== "all" ? { status: currentFilter } : {}),
            });
            const res = await fetch(`${API.APP_POSTS(appId)}?${params}`, { headers: authHeaders() });
            const json: PostsResponse = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message);
            setPostsData(json.data);
        } catch (e) {
            setPageError(e instanceof Error ? e.message : "Failed to load posts.");
        } finally {
            setPostsLoading(false);
        }
    }, [appId, authHeaders]);

    useEffect(() => {
        if (!appLoading) fetchPosts(page, filter);
    }, [page, filter, appLoading, fetchPosts]);

    const handleFilterChange = (f: FilterValue) => { setPage(1); setFilter(f); };

    const showToast = (message: string, type: "success" | "error" = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleMutated = (action: "deleted" | "published" | "scheduled" | "edited" | "rescheduled") => {
        const msgs: Record<typeof action, string> = {
            deleted: "Draft deleted.",
            published: "Post published successfully.",
            scheduled: "Post scheduled.",
            edited: "Post content updated.",
            rescheduled: "Schedule updated.",
        };
        showToast(msgs[action]);
        fetchPosts(page, filter);
    };

    const meta = app ? getPlatformMeta(app.platform) : null;

    return (
        <Suspense fallback={<div className="p-4">Loading details...</div>}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

                {/* Navbar */}
                <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center shrink-0">
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white dark:text-gray-900">
                                    <path d="M1.5 9.5 Q3.5 3.5 7 7 Q10.5 10.5 12.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white tracking-tight">PostWave</span>
                        </div>
                        <UserButton 
                            fallback={"/"} 
                            appearance={{ elements: { avatarBox: "w-8 h-8" } }} 
                        />
                    </div>
                </header>

                <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    {/* Breadcrumb + heading */}
                    <div className="flex items-start justify-between mb-7">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Link href="/dashboard" className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Social hub</Link>
                                <span className="text-gray-300 dark:text-gray-700 text-xs">/</span>
                                <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                                    {appLoading ? "Loading…" : app?.name ?? "App"}
                                </span>
                            </div>

                            {appLoading ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
                                    <div>
                                        <div className="h-5 w-28 rounded bg-gray-200 dark:bg-gray-800 animate-pulse mb-1.5" />
                                        <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                                    </div>
                                </div>
                            ) : app && meta ? (
                                <div className="flex items-center gap-3">
                                    <PlatformBadge platform={app.platform} size="md" />
                                    <div>
                                        <h1 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">{app.name}</h1>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            {app.platform_username ?? meta.label}
                                            {app.connected ? ` · Connected ${fmtDate(app.connected)}` : ""}
                                        </p>
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        {!appLoading && app && (
                            <button
                                onClick={() => setSettingsOpen(true)}
                                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
                            >
                                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="text-gray-500">
                                    <circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.4" />
                                    <path d="M7.5 1v1.5M7.5 12.5V14M14 7.5h-1.5M2.5 7.5H1M11.95 3.05l-1.06 1.06M4.11 10.89l-1.06 1.06M11.95 11.95l-1.06-1.06M4.11 4.11 3.05 3.05" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                </svg>
                                Settings
                            </button>
                        )}
                    </div>

                    {pageError && <ErrorBanner message={pageError} onDismiss={() => setPageError(null)} />}

                    {appLoading ? <PageSkeleton /> : (
                        <>
                            {app && <MetricsGrid app={app} />}

                            <PostsTable
                                postsData={postsData}
                                postsLoading={postsLoading}
                                filter={filter}
                                page={page}
                                onFilterChange={handleFilterChange}
                                onPageChange={setPage}
                                onPostClick={setSelectedPost}
                                onNewPost={() => setGenerateOpen(true)}
                            />
                        </>
                    )}
                </main>

                {/* Post modal */}
                {selectedPost && meta && (
                    <PostModal
                        post={selectedPost}
                        platformMeta={meta}
                        token={token}
                        onClose={() => setSelectedPost(null)}
                        onMutated={handleMutated}
                    />
                )}

                {/* Generate post modal */}
                {generateOpen && app && (
                    <GeneratePostModal
                        appId={String(app.id)}
                        platform={app.platform}
                        token={token}
                        onClose={() => setGenerateOpen(false)}
                        onCreated={() => { showToast("Post created successfully."); fetchPosts(page, filter); }}
                    />
                )}

                {/* Settings drawer */}
                <SettingsDrawer open={settingsOpen} onClose={() => {
                    setSettingsOpen(false);
                    fetchAppDetails();
                }} app={app} />

                {/* Toast */}
                {toast && <Toast message={toast.message} type={toast.type} />}
            </div>
        </Suspense>
    );
}
