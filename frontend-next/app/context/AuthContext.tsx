"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/app/api/api"; // Din rettede api helper uden hårdt redirect

interface AuthContextType {
    user: any;
    loading: boolean;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Samlet og rettet checkAuth funktion
    const checkAuth = async () => {
        try {
            // Vi bruger api-helperen for at få konsistente indstillinger (credentials osv.)
            const res = await api("/api/users/me");

            // Vi tjekker res.ok først (200-299 status)
            if (res.ok) {
                const data = await res.json();
                // Sætter user baseret på din backends svar-struktur
                setUser(data.data || data);
            } else {
                // Hvis status er 401 eller andet, er brugeren gæst
                setUser(null);
            }
        } catch (err) {
            console.error("Auth check failed:", err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const logout = async () => {
        try {
            // Brug api helperen her også for god ordens skyld
            await api("/api/auth/logout", { method: "POST" });
            setUser(null);
            // Brug router.push eller window.location alt efter behov
            window.location.href = "/";
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth skal bruges i en AuthProvider");
    return context;
};