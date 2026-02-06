export async function api(path: string, options: RequestInit = {}) {
    const isClient = typeof window !== "undefined";

    // Vi behøver ikke længere manuelt at indsætte Authorization header,
    // da browseren selv sender "authToken" cookien med.
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };

    const res = await fetch(path, {
        ...options,
        // credentials: "include" er vigtigt hvis din frontend og backend
        // kører på forskellige domæner (f.eks. localhost:3000 og :4000)
        credentials: options.credentials || "include",
        headers
    });

    // FJERN det automatiske redirect her!
    // Vi lader i stedet AuthContext eller middlewaren styre navigationen.
    if (res.status === 401 && isClient) {
        console.warn("401 Unauthorized: Brugeren er ikke logget ind (Gæst)");
        // Vi fjerner intet fra localStorage, da vi bruger cookies nu.
    }

    return res;
}