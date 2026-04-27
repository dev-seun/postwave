"use client";


import { PostsData, FilterValue, PostItem, FILTERS } from "@/app/constant/constants";
import { Spinner, StatusBadge } from "./UIForest";
import { fmtDate, fmt } from "./Utils";

export function PostsTable({ postsData, postsLoading, filter, page, onFilterChange, onPageChange, onPostClick, onNewPost }: {
    postsData: PostsData | null;
    postsLoading: boolean;
    filter: FilterValue;
    page: number;
    onFilterChange: (f: FilterValue) => void;
    onPageChange: (p: number) => void;
    onPostClick: (post: PostItem) => void;
    onNewPost: () => void;
}) {
    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Posts</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {postsData ? `${postsData.total} total` : "Loading…"}
                    </p>
                </div>
                <button
                    onClick={onNewPost}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-xl hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors"
                >
                    <span className="text-base leading-none">+</span> New post
                </button>
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-1 px-4 py-2.5 border-b border-gray-100 dark:border-gray-800">
                {FILTERS.map(f => (
                    <button
                        key={f.value}
                        onClick={() => onFilterChange(f.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors
                            ${filter === f.value
                                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                    >{f.label}</button>
                ))}
                {postsLoading && <div className="ml-auto"><Spinner size={14} /></div>}
            </div>

            {/* Table body */}
            {postsLoading && !postsData ? (
                <div className="flex items-center justify-center py-16"><Spinner size={24} /></div>
            ) : !postsData?.posts.length ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-4 gap-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">No posts found</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Try a different filter</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-800">
                                <th className="text-left text-xs font-medium text-gray-400 dark:text-gray-500 px-5 py-3 w-1/2">Content</th>
                                <th className="text-left text-xs font-medium text-gray-400 dark:text-gray-500 px-3 py-3">Status</th>
                                <th className="text-left text-xs font-medium text-gray-400 dark:text-gray-500 px-3 py-3">Created</th>
                                <th className="text-right text-xs font-medium text-gray-400 dark:text-gray-500 px-3 py-3">Likes</th>
                                <th className="text-right text-xs font-medium text-gray-400 dark:text-gray-500 px-3 py-3">Comments</th>
                                <th className="text-right text-xs font-medium text-gray-400 dark:text-gray-500 px-5 py-3">Reach</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y divide-gray-50 dark:divide-gray-800 transition-opacity ${postsLoading ? "opacity-50" : "opacity-100"}`}>
                            {postsData.posts.map(post => (
                                <tr
                                    key={post.id}
                                    onClick={() => onPostClick(post)}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                                >
                                    <td className="px-5 py-4 max-w-xs">
                                        <p className="text-xs text-gray-800 dark:text-gray-200 line-clamp-2 leading-relaxed">{post.content}</p>
                                    </td>
                                    <td className="px-3 py-4"><StatusBadge status={post.status} /></td>
                                    <td className="px-3 py-4 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{fmtDate(post.created_at)}</td>
                                    <td className="px-3 py-4 text-right text-xs text-gray-700 dark:text-gray-300 tabular-nums">
                                        {post.status === "published" ? fmt(post.likes) : <span className="text-gray-300 dark:text-gray-600">—</span>}
                                    </td>
                                    <td className="px-3 py-4 text-right text-xs text-gray-700 dark:text-gray-300 tabular-nums">
                                        {post.status === "published" ? fmt(post.comments) : <span className="text-gray-300 dark:text-gray-600">—</span>}
                                    </td>
                                    <td className="px-5 py-4 text-right text-xs text-gray-700 dark:text-gray-300 tabular-nums">
                                        {post.status === "published" ? fmt(post.reach) : <span className="text-gray-300 dark:text-gray-600">—</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {postsData && (
                <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                        Page {postsData.page} of {Math.ceil(postsData.total / postsData.limit)} · {postsData.total} posts
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            disabled={!postsData.has_previous || postsLoading}
                            onClick={() => onPageChange(page - 1)}
                            className="px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >← Prev</button>
                        <button
                            disabled={!postsData.has_next || postsLoading}
                            onClick={() => onPageChange(page + 1)}
                            className="px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >Next →</button>
                    </div>
                </div>
            )}
        </div>
    );
}
