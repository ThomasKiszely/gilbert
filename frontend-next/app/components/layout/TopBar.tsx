'use client';

import { Bell, Search, X, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/app/components/UI/button";
import { Input } from "@/app/components/UI/input";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

const TopBar = () => {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = () => {
        if (searchQuery.trim()) {
            router.push(`/products/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30">

            {/* MOBILE: lower height, tighter padding */}
            <div className="relative flex items-center px-4 py-1 md:py-3 h-[44px] md:h-auto">

                {/* LEFT — Search (desktop only) */}
                <div className="hidden md:flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-2 w-[260px]">
                    <Search className="h-4 w-4 text-muted-foreground shrink-0" />

                    <Input
                        type="text"
                        placeholder="Søg efter varer, brands, profiler..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-8 text-sm text-foreground placeholder:text-muted-foreground"
                    />

                    {searchQuery && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSearchQuery("")}
                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                </div>

                {/* CENTER — Logo */}
                <Link
                    href="/"
                    className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
                >
                    <h1 className="text-xl md:text-2xl font-bold tracking-widest text-foreground font-serif uppercase leading-none">
                        GILBERT
                    </h1>
                </Link>

                {/* RIGHT — Desktop */}
                <div className="hidden md:flex absolute right-4 items-center gap-4">

                    <Link
                        href="/products/create"
                        className="px-4 py-1 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-80 transition"
                    >
                        Sell an item
                    </Link>

                    {user?.role === "admin" && (
                        <Link
                            href="/admin"
                            className="text-accent font-bold hover:brightness-125"
                        >
                            Admin
                        </Link>
                    )}

                    {user ? (
                        <>
                            <Link href="/profile/me" className="text-foreground hover:text-white">
                                {user.username}
                            </Link>

                            <button
                                onClick={logout}
                                className="text-foreground hover:text-red-400 transition"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        !loading && (
                            <Link href="/login" className="text-foreground hover:text-white">
                                Login
                            </Link>
                        )
                    )}

                    <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted">
                        <Bell className="h-5 w-5" />
                    </Button>

                    <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted">
                        <ShoppingBag className="h-5 w-5" />
                    </Button>
                </div>

                {/* RIGHT — Mobile */}
                <div className="flex md:hidden absolute right-4 top-1/2 -translate-y-1/2 items-center gap-3">
                    <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted">
                        <Bell className="h-5 w-5" />
                    </Button>

                    <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted">
                        <ShoppingBag className="h-5 w-5" />
                    </Button>
                </div>

            </div>
        </header>
    );
};

export default TopBar;
