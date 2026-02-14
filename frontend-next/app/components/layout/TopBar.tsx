"use client";

import { Bell, Search, X, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/app/components/UI/button";
import { Input } from "@/app/components/UI/input";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

// Oversætter dine backend-typer til pæn tekst
const formatNotificationType = (type: string) => {
    const labels: Record<string, string> = {
        new_bid: "New bid",
        chat_message: "New message",
        bid_accepted: "Bid accepted",
        bid_rejected: "Bid rejected",
        bid_expired: "Bud expired",
        counter_bid: "Counter bid",
    };
    return labels[type] || type.replace('_', ' ');
};

const TopBar = () => {
    const {user, loading, logout} = useAuth();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");

    // --- NOTIFIKATION STATES ---
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotis, setShowNotis] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 1. Hent notifikationer (Husk: din backend pakker dem ind i 'notifications' feltet)
    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                if (data.success && Array.isArray(data.notifications)) {
                    setNotifications(data.notifications);
                }
            }
        } catch (err) {
            console.error("Fejl ved hentning af notifikationer:", err);
        }
    };

    // 2. Polling og Luk-ved-klik-udenfor
    useEffect(() => {
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);

            const handleClickOutside = (event: MouseEvent) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                    setShowNotis(false);
                }
            };

            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                clearInterval(interval);
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }
    }, [user]);

    const unreadCount = notifications.filter((n: any) => !n.read).length;

    // 3. Håndter klik og markér som læst
    const handleNotificationClick = async (notif: any) => {
        if (!notif.read) {
            try {
                const res = await fetch(`/api/notifications/${notif._id}/read`, {method: 'POST'});
                const data = await res.json();
                if (data.success) {
                    setNotifications((prev) =>
                        prev.map((n) => n._id === notif._id ? {...n, read: true} : n)
                    );
                }
            } catch (err) {
                console.error("Kunne ikke markere som læst:", err);
            }
        }

        setShowNotis(false);

        // Navigation (App-flow)
        if (notif.type === 'chat_message' && notif.data?.threadId) {
            router.push(`/chat/${notif.data.threadId}`);
        } else if (notif.data?.productId) {
            router.push(`/products/${notif.data.productId}`);
        }
    };

    const handleSearch = () => {
        if (!searchQuery.trim()) return;
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30">
            <div className="relative flex items-center px-4 py-1 md:py-3 h-[44px] md:h-auto">

                {/* LEFT — Search (desktop only) */}
                <div className="hidden md:flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-2 w-[260px]">
                    <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Input
                        type="text"
                        placeholder="Search items, users…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-8 text-sm"
                    />
                    {searchQuery && (
                        <Button variant="ghost" size="icon" onClick={() => setSearchQuery("")} className="h-6 w-6">
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                </div>

                {/* CENTER — Logo */}
                <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <h1 className="text-xl md:text-2xl font-bold tracking-widest text-foreground font-serif uppercase leading-none">
                        GILBERT
                    </h1>
                </Link>

                {/* RIGHT — EVERYTHING */}
                <div className="absolute right-4 flex items-center gap-4">

                    {/* Admin link */}
                    {user?.role === "admin" && (
                        <Link
                            href="/admin"
                            className="hidden md:block text-accent font-bold hover:brightness-125"
                        >
                            Admin
                        </Link>
                    )}


                    {/* Sell + Profile + Logout */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link
                            href="/products/create"
                            className="px-4 py-1 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-80 transition"
                        >
                            Sell an item
                        </Link>

                        {user ? (
                            <>
                                <Link
                                    href="/profile/me"
                                    className="text-sm font-medium hover:text-primary transition text-foreground"
                                >
                                    {user.username}
                                </Link>

                                <button
                                    onClick={logout}
                                    className="text-sm text-muted-foreground hover:text-red-400 transition"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            !loading && (
                                <Link
                                    href="/login"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Login
                                </Link>
                            )
                        )}
                    </div>

                    {/* NOTIFICATION BELL */}
                    <div className="relative" ref={dropdownRef}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-foreground relative hover:bg-muted"
                            onClick={() => user && setShowNotis(!showNotis)}
                        >
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[9px] text-white font-bold border-2 border-background">
                                {unreadCount}
                            </span>
                            )}
                        </Button>

                        {showNotis && (
                            <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-border bg-popover shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in duration-150">
                                <div className="p-4 border-b border-border bg-muted/10 flex justify-between items-center">
                                    <span className="font-bold text-sm text-foreground">Notifikationer</span>
                                    {unreadCount > 0 && (
                                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                                        {unreadCount} nye
                                    </span>
                                    )}
                                </div>

                                <div className="max-h-[350px] overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-10 text-center">
                                            <Bell className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                                            <p className="text-xs text-muted-foreground">Ingen notifikationer endnu</p>
                                        </div>
                                    ) : (
                                        notifications.map((n: any) => (
                                            <div
                                                key={n._id}
                                                onClick={() => handleNotificationClick(n)}
                                                className={`p-4 border-b border-border/50 last:border-0 cursor-pointer transition-colors hover:bg-muted/50 ${!n.read ? 'bg-primary/5' : ''}`}
                                            >
                                                <div className="flex justify-between items-center mb-1">
                                                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">
                                                    {formatNotificationType(n.type)}
                                                </span>
                                                    <span className="text-[9px] text-muted-foreground/60">
                                                    {new Date(n.createdAt).toLocaleDateString('da-DK')}
                                                </span>
                                                </div>
                                                <p className={`text-sm leading-tight ${!n.read ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                                                    {n.type === 'chat_message'
                                                        ? (n.data?.text ? `"${n.data.text}"` : "You have received a new message")
                                                        : (n.data?.message || "You have a new update on your account")
                                                    }
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <Link
                                    href="/profile/notifications"
                                    className="block p-3 text-center text-[11px] font-bold uppercase tracking-widest bg-muted/20 hover:bg-muted/40 transition text-foreground"
                                    onClick={() => setShowNotis(false)}
                                >
                                    Se alle
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* CART */}
                    <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted">
                        <ShoppingBag className="h-5 w-5" />
                    </Button>

                </div>
            </div>
        </header>
    );

}

export default TopBar;