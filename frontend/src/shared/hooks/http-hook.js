import { useCallback, useEffect, useRef, useState } from "react";

export const useHttpClient = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();
    const activeHttpRequests = useRef([]);

    const API_BASE = (process.env.REACT_APP_BACKEND_URL || "").trim();

    const buildUrl = (endpoint) => {
        if (!endpoint) return "";
        if (/^https?:\/\//i.test(endpoint)) return endpoint;     // absolute given
        const base = API_BASE.replace(/\/+$/, "");               // strip trailing /
        const path = `/${endpoint}`.replace(/\/{2,}/g, "/");     // ensure single leading /
        return base ? `${base}${path}` : path;                   // default = same-origin
    };

    const sendRequest = useCallback(async (endpoint, method = "GET", body = null, headers = {}) => {
        setIsLoading(true);
        const abortCtrl = new AbortController();
        activeHttpRequests.current.push(abortCtrl);

        const url = buildUrl(endpoint);
        try {
            const resp = await fetch(url, { method, body, headers, signal: abortCtrl.signal });
            const isJson = resp.headers.get("content-type")?.includes("application/json");
            const data = isJson ? await resp.json() : null;

            activeHttpRequests.current = activeHttpRequests.current.filter(c => c !== abortCtrl);
            if (!resp.ok) throw new Error(data?.message || resp.statusText || "Request failed");
            setIsLoading(false);
            return data;
        } catch (err) {
            if (err.name !== "AbortError") setError(err.message || "Request failed");
            setIsLoading(false);
            throw err;
        }
    }, [API_BASE]);

    useEffect(() => () => activeHttpRequests.current.forEach(c => c.abort()), []);
    const clearError = () => setError(null);
    return { isLoading, error, sendRequest, clearError };
};
