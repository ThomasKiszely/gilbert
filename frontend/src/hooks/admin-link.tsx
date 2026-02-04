import { useEffect, useState } from "react";

export function useAdmin() {
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        async function check() {
            try {
                const res = await fetch("/api/users/me", {
                    credentials: "include"
                });

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
