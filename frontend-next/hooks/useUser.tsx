import { useEffect, useState } from "react";
import { api } from "@/app/api/api";

export function useUser() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await api("/api/users/me");

                if (!res.ok) {
                    setLoading(false);
                    return;
                }

                const json = await res.json();
                if (json.success) {
                    setUser(json.data);
                }
            } catch (err) {
                console.error("Failed to load user", err);
            }

            setLoading(false);
        }

        fetchUser();
    }, []);

    return { user, loading };
}
