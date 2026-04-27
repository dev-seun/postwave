"use client";

import { Platform } from "../constant/constants";
import { PlatformBadge } from "./ConnectModal";
import Link from "next/dist/client/link";


export function AppCard({
    platform,
    onRemove,
}: {
    platform: Platform;
    onRemove: (id: string) => void;
}) {
    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 flex flex-col gap-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <PlatformBadge platform={platform} />
                    <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {platform.handle}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {platform.name}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => onRemove(platform.id)}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950"
                >
                    Remove
                </button>
            </div>

            <div className="grid grid-cols-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Followers</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                        {platform.stat.followers}
                    </p>
                </div>
                <div className="text-center border-x border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Posts</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                        {platform.stat.posts}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Engagement</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                        {platform.stat.engagement}
                    </p>
                </div>
            </div>

            {/* <button
                onClick={() => navigate(`/dashboard/${platform.id}/create-post`)}
            className="w-full text-sm py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                New post for {platform.name} →
            </button> */}
            <Link
                // href={`/dashboard/${platform.app_id}/details`}
                href={{
                    pathname: "/dashboard/details",
                    query: { appId: platform.app_id }
                }}
                className="block w-full text-center text-sm py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
                New post for {platform.name} →
            </Link>
        </div>
    );
}
