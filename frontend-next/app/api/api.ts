export async function api(path: string, options: RequestInit = {}) {
    const isClient = typeof window !== "undefined";
    const token = isClient ? localStorage.getItem("token") : null;

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    const res = await fetch(path, {
        ...options,
        headers
    });

    if (res.status === 401 && isClient) {
        localStorage.removeItem("token");

        if (window.location.pathname !== "/login") {
            window.location.href = "/login";
        }
    }

    return res;
}