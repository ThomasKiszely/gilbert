import { Navigate } from "react-router-dom";
import { useAdmin } from "../../hooks/admin-link.tsx";
import type {JSX} from "react";

export default function ProtectedAdminRoute({ children }: { children: JSX.Element }) {
    const { loading, isAdmin } = useAdmin();

    if (loading) return <p className="p-6">Checking admin access…</p>;

    if (!isAdmin) return <Navigate to="/" replace />;

    return children;
}
