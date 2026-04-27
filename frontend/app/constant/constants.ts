
export const PLATFORMS = [
    {
        id: "x",
        app_id: 0,
        name: "X (Twitter)",
        handle: "",
        connected: '',
        abbr: "X",
        status: "available",
        color: "bg-slate-100 border-slate-400 text-slate-700",
        stat: { followers: "12.4K", posts: 284, engagement: "3.2%" },
    },
    {
        id: "ig",
        app_id: 0,
        name: "Instagram",
        handle: "",
        connected: '',
        abbr: "IG",
        status: "unavailable",
        color: "bg-pink-50 border-pink-400 text-pink-800",
        stat: { followers: "8.1K", posts: 156, engagement: "5.7%" },
    },
    {
        id: "fb",
        app_id: 0,
        name: "Facebook",
        handle: "",
        connected: '',
        abbr: "FB",
        status: "unavailable",
        color: "bg-blue-50 border-blue-400 text-blue-800",
        stat: { followers: "3.2K", posts: 98, engagement: "2.1%" },
    },
    {
        id: "li",
        app_id: 0,
        name: "LinkedIn",
        handle: "",
        connected: '',
        abbr: "LI",
        status: "unavailable",
        color: "bg-sky-50 border-sky-400 text-sky-800",
        stat: { followers: "2.8K", posts: 67, engagement: "4.3%" },
    },
    {
        id: "tt",
        app_id: 0,
        name: "TikTok",
        handle: "",
        connected: '',
        abbr: "TT",
        status: "unavailable",
        color: "bg-teal-50 border-teal-400 text-teal-800",
        stat: { followers: "45K", posts: 312, engagement: "8.9%" },
    },
    {
        id: "pi",
        app_id: 0,
        name: "Pinterest",
        handle: "",
        connected: '',
        abbr: "PI",
        status: "unavailable",
        color: "bg-red-50 border-red-400 text-red-700",
        stat: { followers: "6.7K", posts: 891, engagement: "1.4%" },
    },
    {
        id: "yt",
        app_id: 0,
        name: "YouTube",
        handle: "",
        connected: '',
        abbr: "YT",
        status: "unavailable",
        color: "bg-orange-50 border-orange-400 text-orange-800",
        stat: { followers: "1.2K", posts: 43, engagement: "6.2%" },
    },
    {
        id: "th",
        app_id: 0,
        name: "Threads",
        handle: "",
        connected: '',
        abbr: "TH",
        status: "unavailable",
        color: "bg-gray-100 border-gray-400 text-gray-700",
        stat: { followers: "3.4K", posts: 127, engagement: "3.8%" },
    },
] as const;

export type PlatformId = (typeof PLATFORMS)[number]["id"];
export type Platform = (typeof PLATFORMS)[number] & { handle: string };

// Adjust to match your actual GET /apps response shape
export interface AppRecord {
    id: PlatformId;
    app_id: number;
    name: string;
    platform?: string;
    followers: number;
    posts: number;
    engagements : number;
    platform_username : string;
}

export interface PlatformConnection {
    id: number;
    name: string;
    platform_connections: AppRecord[];
}

export interface App {
    id: number;
    name: string;
    platform_connections: PlatformConnection[];
}


export interface AppData {
    id: number;
    name: string;
    platform: string;
    followers: number;
    posts: number;
    platform_username: string | null;
    engagements: number;
    connected: string | null;
    user: { user_id: string };
    is_active: boolean;
    credentials: string | null;
    auto_publish_post: boolean;
    failure_notification: boolean;
}

export interface AppDetailResponse {
    success: boolean;
    message: string;
    data: AppData;
}

export type PostStatus = "published" | "draft" | "failed" | "scheduled";

export interface PostItem {
    id: number;
    content: string;
    platform: string;
    publishAt: string | null;
    scheduled_time: string | null;
    created_at: string;
    likes: number;
    comments: number;
    shares: number;
    reach: number;
    status: PostStatus;
}

export interface PostsData {
    total: number;
    page: number;
    limit: number;
    has_next: boolean;
    has_previous: boolean;
    posts: PostItem[];
}

export interface PostsResponse {
    success: boolean;
    message: string;
    data: PostsData;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const LIMIT = 10;

export const PLATFORM_META: Record<string, { abbr: string; color: string; label: string }> = {
    x: { abbr: "X", color: "bg-slate-100 border-slate-400 text-slate-700", label: "X (Twitter)" },
    instagram: { abbr: "IG", color: "bg-pink-50 border-pink-400 text-pink-800", label: "Instagram" },
    facebook: { abbr: "FB", color: "bg-blue-50 border-blue-400 text-blue-800", label: "Facebook" },
    linkedin: { abbr: "LI", color: "bg-sky-50 border-sky-400 text-sky-800", label: "LinkedIn" },
    tiktok: { abbr: "TT", color: "bg-teal-50 border-teal-400 text-teal-800", label: "TikTok" },
    pinterest: { abbr: "PI", color: "bg-red-50 border-red-400 text-red-700", label: "Pinterest" },
    youtube: { abbr: "YT", color: "bg-orange-50 border-orange-400 text-orange-800", label: "YouTube" },
    threads: { abbr: "TH", color: "bg-gray-100 border-gray-400 text-gray-700", label: "Threads" },
};

export const STATUS_STYLES: Record<PostStatus, string> = {
    published: "bg-emerald-50 text-emerald-700 border-emerald-200",
    draft: "bg-gray-100 text-gray-500 border-gray-200",
    failed: "bg-red-50 text-red-600 border-red-200",
    scheduled: "bg-violet-50 text-violet-700 border-violet-200",
};

export const STATUS_DOT: Record<PostStatus, string> = {
    published: "bg-emerald-500",
    draft: "bg-gray-400",
    failed: "bg-red-500",
    scheduled: "bg-violet-500",
};

export type FilterValue = "all" | PostStatus;
export const FILTERS: { label: string; value: FilterValue }[] = [
    { label: "All", value: "all" },
    { label: "Published", value: "published" },
    { label: "Scheduled", value: "scheduled" },
    { label: "Draft", value: "draft" },
    { label: "Failed", value: "failed" },
];
