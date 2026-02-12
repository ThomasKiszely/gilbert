export async function api(path: string, options: RequestInit = {}) {
    const isClient = typeof window !== "undefined";

    // Start med en Headers() instans
    const headers = new Headers(options.headers);

    // Hvis body IKKE er FormData → sæt JSON header
    if (!(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
    }

    const res = await fetch(path, {
        ...options,
        credentials: options.credentials || "include",
        headers
    });

    if (res.status === 401 && isClient) {
        console.warn("401 Unauthorized: Brugeren er ikke logget ind (Gæst)");
    }

    return res;
}
