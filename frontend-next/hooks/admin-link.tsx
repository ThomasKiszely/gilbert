import { useEffect, useState } from "react";

import { api } from "@/app/api/api";

export function useAdmin() {
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        async function check() {
            try {
                const res = await api("/api/users/me");

                if (!res.ok) {
                    setLoading(false);
                    return;
                }

                const json = await res.json();
                if (json.success && json.data.role === "admin") {
                    setIsAdmin(true);
                }
            } catch (err) {
                console.error("Admin check failed", err);
            }

            setLoading(false);
        }

        check();
    }, []);

    return { loading, isAdmin };
}
