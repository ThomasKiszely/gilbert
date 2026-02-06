'use client';

import { useAdmin } from "@/hooks/admin-link";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export default function ProtectedAdminRoute({ children }: { children: ReactNode }) {
    const { loading, isAdmin } = useAdmin();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAdmin) {
            router.replace("/");
        }
    }, [loading, isAdmin, router]);

    // Vis en loader mens vi tjekker adgang
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg font-medium">Checking admin access…</p>
            </div>
        );
    }

    // Hvis ikke admin, returner intet (mens useEffect redirecter)
    if (!isAdmin) {
        return null;
    }

    // Hvis admin, vis indholdet
    return <>{children}</>;
}