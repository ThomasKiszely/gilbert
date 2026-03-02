export async function api(path: string, options: RequestInit = {}) {
    const isClient = typeof window !== "undefined";

    const headers = new Headers(options.headers);

    if (!(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
    }

    /*
    // GAMMELT: Brugte Authorization header + localStorage token
    if (isClient) {
        const token = localStorage.getItem("token");
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }
    }
    */

    // Første request
    let res = await fetch(path, {
        ...options,
        credentials: "include",
        headers
    });

    if (res.status === 401 && isClient) {
        console.warn("401 Unauthorized – forsøger refresh…");

        const refreshRes = await fetch("/auth/refresh", {
            method: "POST",
            credentials: "include"
        });

        if (refreshRes.ok) {

            /*
            // GAMMELT: Hentede nyt token og lagde i localStorage + header
            const data = await refreshRes.json();
            const newToken = data.accessToken;

            if (newToken) {
                localStorage.setItem("token", newToken);
                headers.set("Authorization", `Bearer ${newToken}`);
            }
            */

            // NYT: Cookies er opdateret → prøv original request igen
            res = await fetch(path, {
                ...options,
                credentials: "include",
                headers
            });
        }
    }

    return res;
}
