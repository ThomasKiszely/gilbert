'use client';

import { Bell, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/UI/button";
import { api } from "@/app/api/api";

const TopBar = ({ user, loading }: { user: any; loading: boolean }) => {
    const router = useRouter();

    async function handleLogout() {
        try {
            await api("/api/auth/logout", { method: "POST" });
        } catch (err) {
            console.error("Logout failed", err);
        }
        localStorage.removeItem("token");
        window.location.href = "/login";
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/10">
            <div className="flex items-center justify-between px-4 py-3">
                {/* Left - Notifications */}
                <Button variant="ghost" size="icon" className="text-foreground hover:bg-white/10">
                    <Bell className="h-5 w-5" />
                </Button>

                {/* Center - Logo */}
                <Link href="/" className="flex flex-col items-center">
                    <h1 className="text-2xl font-bold tracking-widest text-foreground font-serif uppercase">
                        GILBERT
                    </h1>
                </Link>

                {/* Right - Cart */}
                <Button variant="ghost" size="icon" className="text-foreground hover:bg-white/10">
                    <ShoppingBag className="h-5 w-5" />
                </Button>
            </div>

            {/* Navigation links */}
            <nav className="flex justify-center gap-6 py-2 text-xs md:text-sm font-medium border-t border-border/10 bg-background/50">
                <Link href="/profile/me" className="text-foreground hover:text-white transition">My Page</Link>
                <Link href="/products/create" className="text-foreground hover:text-white transition">Create Product</Link>

                {!user && !loading && (
                    <Link href="/login" className="text-foreground hover:text-white transition">Login</Link>
                )}

                {user && (
                    <>
                        {user.role === "admin" && (
                            <Link href="/admin" className="text-accent hover:brightness-125 font-bold transition">Admin</Link>
                        )}
                        <button
                            onClick={handleLogout}
                            className="text-foreground hover:text-red-400 transition cursor-pointer"
                        >
                            Logout
                        </button>
                    </>
                )}
            </nav>
        </header>
    );
};

export default TopBar;