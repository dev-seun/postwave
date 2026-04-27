import { PLATFORM_META } from "@/app/constant/constants";

export function getPlatformMeta(platform: string) {
    return PLATFORM_META[platform.toLowerCase()] ?? {
        abbr: platform.slice(0, 2).toUpperCase(),
        color: "bg-gray-100 border-gray-300 text-gray-600",
        label: platform,
    };
}

export function fmt(n: number) {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
}

export function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function fmtDateTime(iso: string) {
    return new Date(iso).toLocaleString("en-US", {
        month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
}

export function minScheduleTime() {
    const d = new Date(Date.now() + 60_000);
    return d.toISOString().slice(0, 16);
}
