import type { ReactElement } from "react";

import {Navigate} from "react-router-dom";

export function AdminRoute({ children }: { children: ReactElement }) {
    const token = localStorage.getItem("token");
    const user = token ? JSON.parse(atob(token.split(".")[1])) : null;

    if (!user || user.role !== "admin") {
        return <Navigate to="/" replace />;
    }

    return children;
}
