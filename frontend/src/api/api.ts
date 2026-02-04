export async function api(path: string, options: RequestInit = {}) {
    const token = localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    return fetch(path, {
        ...options,
        headers
    });
}
