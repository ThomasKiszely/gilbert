'use client';

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            // Hvis der ikke er et token, send brugeren til login
            router.replace("/login");
        } else {
            setIsLoggedIn(true);
        }

        setLoading(false);
    }, [router]);

    // Vis ingenting eller en loader, mens vi tjekker om brugeren har adgang
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
        );
    }

    // Hvis vi er logget ind, vis indholdet. Ellers intet (mens routeren redirecter)
    return isLoggedIn ? <>{children}</> : null;
}