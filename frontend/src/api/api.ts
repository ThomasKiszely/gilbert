export async function api(path: string, options: RequestInit = {}) {
    const token = localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    const res = await fetch(path, {
        ...options,
        headers
    });
    if (res.status === 401) {
        localStorage.removeItem("token");
        if (window.location.pathname !== "/login") {
            window.location.href = "/login";
        }

        return res;
    }
    return res;
}
