"use client";


import { useState } from "react";
import { useApiCall } from "../hook/apicall";

import { ModalWrapper, ModalHeader, StatusBadge, TabBar, InlineError, FieldLabel, Textarea, ModalFooter, DangerButton, GhostButton, PrimaryButton } from "./UIForest";
import { getPlatformMeta, minScheduleTime, fmtDateTime, fmt } from "./Utils";
import { API } from "@/app/constant/baseurl";
import { PostItem } from "@/app/constant/constants";


type ModalTab = "view" | "edit" | "schedule";

export function PostModal({ post, platformMeta, token, onClose, onMutated }: {
    post: PostItem;
    platformMeta: ReturnType<typeof getPlatformMeta>;
    token: string | null;
    onClose: () => void;
    onMutated: (action: "deleted" | "published" | "scheduled" | "edited" | "rescheduled") => void;
}) {
    const [tab, setTab] = useState<ModalTab>("view");
    const [editContent, setEditContent] = useState(post.content);
    const [schedTime, setSchedTime] = useState(
        post.status === "scheduled" && post.publishAt
            ? new Date(post.publishAt).toISOString().slice(0, 16)
            : minScheduleTime()
    );

    const { busy, error, setError, call } = useApiCall(token);

    const handleTabChange = (t: ModalTab) => { setTab(t); setError(null); };

    const handleDelete = async () => {
        if (!confirm("Delete this draft? This cannot be undone.")) return;
        if (await call(API.DELETE_POST(String(post.id)), "DELETE")) { onMutated("deleted"); onClose(); }
    };

    const handlePublish = async () => {
        if (await call(API.PUBLISH_POST(String(post.id)), "POST")) { onMutated("published"); onClose(); }
    };

    const handleSchedule = async () => {
        if (new Date(schedTime) <= new Date()) { setError("Scheduled time must be in the future."); return; }
        const endpoint = post.status === "scheduled" ? API.EDIT_SCHEDULE(String(post.id)) : API.SCHEDULE_POST(String(post.id));
        const method = post.status === "scheduled" ? "PATCH" : "POST";
        const action = post.status === "scheduled" ? "rescheduled" : "scheduled";
        if (await call(endpoint, method, { scheduled_time: schedTime })) { onMutated(action); onClose(); }
    };

    const handleEdit = async () => {
        if (!editContent.trim()) { setError("Content cannot be empty."); return; }
        if (await call(API.EDIT_POST(String(post.id)), "PATCH", { new_content: editContent })) { onMutated("edited"); onClose(); }
    };

    const isEditable = post.status === "draft" || post.status === "failed" || post.status === "scheduled";
    const isSchedulable = post.status === "draft" || post.status === "scheduled";

    const tabs = [
        { id: "view" as ModalTab, label: "Details" },
        ...(isEditable ? [{ id: "edit" as ModalTab, label: "Edit" }] : []),
        ...(isSchedulable ? [{ id: "schedule" as ModalTab, label: post.status === "scheduled" ? "Reschedule" : "Schedule" }] : []),
    ];

    return (
        <ModalWrapper onClose={onClose}>
            <ModalHeader
                title={`Post #${post.id}`}
                subtitle={platformMeta.label}
                onClose={onClose}
                right={<StatusBadge status={post.status} />}
            />

            {tabs.length > 1 && <TabBar tabs={tabs} active={tab} onChange={handleTabChange} />}

            <div className="overflow-y-auto flex-1 p-5 space-y-4">
                {error && <InlineError message={error} />}

                {/* ── VIEW TAB ── */}
                {tab === "view" && (
                    <>
                        <div>
                            <FieldLabel>Content</FieldLabel>
                            <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-700">
                                {post.content}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3">
                                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Created</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{fmtDateTime(post.created_at)}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3">
                                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
                                    {post.status === "scheduled" ? "Scheduled for" : post.status == "failed" ? "---": "Published at"}
                                </p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {post.publishAt ? fmtDateTime(post.publishAt) : post.status === "failed" ? "---" : post.status === "scheduled" ? fmtDateTime(post.scheduled_time!) : "—"}
                                </p>
                            </div>
                        </div>
                        <div>
                            <FieldLabel>Engagement</FieldLabel>
                            <div className="grid grid-cols-4 divide-x divide-gray-100 dark:divide-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                {[
                                    { label: "Likes", val: post.likes },
                                    { label: "Comments", val: post.comments },
                                    { label: "Shares", val: post.shares },
                                    { label: "Reach", val: post.reach },
                                ].map(s => (
                                    <div key={s.label} className="text-center py-3 px-2">
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{s.label}</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                                            {post.status === "published" ? fmt(s.val) : <span className="text-gray-300 dark:text-gray-600">—</span>}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* ── EDIT TAB ── */}
                {tab === "edit" && (
                    <div>
                        <FieldLabel>Content</FieldLabel>
                        <Textarea value={editContent} onChange={setEditContent} rows={8} maxLength={2000} />
                    </div>
                )}

                {/* ── SCHEDULE TAB ── */}
                {tab === "schedule" && (
                    <div className="space-y-4">
                        <div>
                            <FieldLabel>{post.status === "scheduled" ? "New scheduled time" : "Scheduled time"}</FieldLabel>
                            <input
                                type="datetime-local"
                                value={schedTime}
                                min={minScheduleTime()}
                                onChange={e => setSchedTime(e.target.value)}
                                className="w-full text-sm px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/10 transition"
                            />
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                                {post.status === "scheduled" && post.publishAt
                                    ? `Currently scheduled for ${fmtDateTime(post.publishAt)}`
                                    : "Time must be in the future."}
                            </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3">
                            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Post preview</p>
                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">{post.content}</p>
                        </div>
                    </div>
                )}
            </div>

            <ModalFooter
                left={
                    post.status === "draft" && (
                        <DangerButton onClick={handleDelete} disabled={busy}>Delete draft</DangerButton>
                    )
                }
                right={<>
                    <GhostButton onClick={onClose} disabled={busy}>Close</GhostButton>
                    {tab === "view" && post.status === "draft" && (
                        <PrimaryButton onClick={handlePublish} busy={busy}>Publish now</PrimaryButton>
                    )}
                    {tab === "edit" && (
                        <PrimaryButton onClick={handleEdit} busy={busy} disabled={!editContent.trim()}>Save changes</PrimaryButton>
                    )}
                    {tab === "schedule" && (
                        <PrimaryButton onClick={handleSchedule} busy={busy}>
                            {post.status === "scheduled" ? "Update schedule" : "Confirm schedule"}
                        </PrimaryButton>
                    )}
                </>}
            />
        </ModalWrapper>
    );
}
