"use client";

import { useState } from "react";
import { ModalWrapper, ModalHeader, InlineError, FieldLabel, Textarea, Toggle, PlatformBadge, ModalFooter, GhostButton, PrimaryButton } from "./UIForest";
import { getPlatformMeta } from "./Utils";
import { useApiCall } from "../hook/apicall";
import { API } from "@/app/constant/baseurl";


export function GeneratePostModal({ appId, platform, token, onClose, onCreated }: {
    appId: string;
    platform: string;
    token: string | null;
    onClose: () => void;
    onCreated: () => void;
}) {
    const [context, setContext] = useState("");
    const [useLLM, setUseLLM] = useState(true);
    const { busy, error, setError, call } = useApiCall(token);

    const handleGenerate = async () => {
        if (!context.trim()) { setError("Please enter some context for the post."); return; }
        const ok = await call(API.APP_GENERATE(appId), "POST", {
            context,
            platform,
            use_llm: useLLM,
        });
        if (ok) { onCreated(); onClose(); }
    };

    return (
        <ModalWrapper onClose={onClose}>
            <ModalHeader title="Generate New Post" subtitle={`Platform: ${getPlatformMeta(platform).label}`} onClose={onClose} />

            <div className="overflow-y-auto flex-1 p-5 space-y-5">
                {error && <InlineError message={error} />}

                <div>
                    <FieldLabel>Context</FieldLabel>
                    <Textarea
                        value={context}
                        onChange={setContext}
                        rows={6}
                        maxLength={1000}
                        placeholder={useLLM
                            ? "Describe what this post should be about…"
                            : "This will be used directly as the post content…"}
                    />
                </div>

                {/* use_llm toggle */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">AI Generation</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                            {useLLM
                                ? "AI will craft an engaging post based on your context."
                                : "Your context will be used as-is without AI rewriting."}
                        </p>
                    </div>
                    <Toggle value={useLLM} onChange={setUseLLM} />
                </div>

                {/* Platform hint */}
                <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                    <PlatformBadge platform={platform} />
                    <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Optimized for</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{getPlatformMeta(platform).label}</p>
                    </div>
                </div>
            </div>

            <ModalFooter
                right={<>
                    <GhostButton onClick={onClose} disabled={busy}>Cancel</GhostButton>
                    <PrimaryButton onClick={handleGenerate} busy={busy} disabled={!context.trim()}>
                        {useLLM ? "Generate post" : "Create post"}
                    </PrimaryButton>
                </>}
            />
        </ModalWrapper>
    );
}
