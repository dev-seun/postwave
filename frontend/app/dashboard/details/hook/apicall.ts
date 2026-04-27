"use client";

import { useState, useCallback } from "react";

export function useApiCall(token: string | null) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const call = useCallback(async (url: string, method: string, body?: object): Promise<boolean> => {
        setBusy(true);
        setError(null);
        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                ...(body ? { body: JSON.stringify(body) } : {}),
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message ?? `Error ${res.status}`);
            return true;
        } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong");
            return false;
        } finally {
            setBusy(false);
        }
    }, [token]);

    return { busy, error, setError, call };
}