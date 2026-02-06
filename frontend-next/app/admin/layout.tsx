'use client';
import ProtectedAdminRoute from "@/app/components/auth/ProtectedAdminRoute";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedAdminRoute>
            {children}
        </ProtectedAdminRoute>
    );
}