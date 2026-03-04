"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import Image from "next/image";
import {
    Search,
    MessageSquare,
    Bell,
    ArrowRight,
    Sparkles,
    AlertTriangle,
    DollarSign,
    Package,
    TrendingUp
} from "lucide-react";

export default function SocialHubPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<"chats" | "activity">("chats");
    const [threads, setThreads] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [threadsRes, notificationsRes] = await Promise.all([
                    fetch("/api/chats/threads"),
                    fetch("/api/notifications")
                ]);

                const threadsData = await threadsRes.json();
                const notificationsData = await notificationsRes.json();

                if (threadsData.success) {
                    setThreads(threadsData.message || []);
                }

                if (notificationsData.success) {
                    // FILTRERING: Vi fjerner chat_message her, så de kun ses i Inbox
                    const activityOnly = (notificationsData.notifications || []).filter(
                        (n: any) => n.type !== "chat_message"
                    );
                    setNotifications(activityOnly);
                }
            } catch (err) {
                console.error("Error fetching hub data:", err);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchData();
    }, [user]);

    // Funktion til at markere som læst (lokal opdatering)
    const markAsRead = async (id: string) => {
        try {
            await fetch(`/api/notifications/${id}/read`, { method: "POST" });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#003d2b] flex items-center justify-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/40 animate-pulse">
                LOADING HUB...
            </div>
        </div>
    );

    const unreadNotifications = notifications.filter(n => !n.read).length;

    return (
        <div className="min-h-screen bg-[#003d2b] pb-20">
            <div className="max-w-4xl mx-auto pt-20 px-4">

                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6 text-white">
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter italic leading-none">Social Hub</h1>
                        <p className="text-white/40 text-[10px] font-mono uppercase tracking-[0.3em] mt-2">Messages & Activity</p>
                    </div>

                    <div className="flex bg-black/20 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 w-full md:w-auto shadow-2xl">
                        <button
                            onClick={() => setActiveTab("chats")}
                            className={`flex-1 md:flex-none md:px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "chats" ? "bg-white text-black shadow-xl" : "text-white/50 hover:text-white"}`}
                        >
                            Inbox ({threads.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("activity")}
                            className={`flex-1 md:flex-none md:px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === "activity" ? "bg-white text-black shadow-xl" : "text-white/50 hover:text-white"}`}
                        >
                            Activity
                            {unreadNotifications > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-600 text-white rounded-full flex items-center justify-center text-[9px] font-bold border-2 border-[#003d2b]">
                                    {unreadNotifications}
                                    </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* --- CONTENT BOX --- */}
                <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 min-h-[400px]">
                    <div className="divide-y divide-gray-50">
                        {activeTab === "chats" ? (
                            threads.length === 0 ? (
                                <EmptyState icon={<MessageSquare size={40} />} text="No messages yet" />
                            ) : (
                                threads.map(t => <ChatThreadItem key={t._id} thread={t} user={user} />)
                            )
                        ) : (
                            notifications.length === 0 ? (
                                <EmptyState icon={<Bell size={40} />} text="No new activity" />
                            ) : (
                                notifications.map(n => <ActivityItem key={n._id} n={n} onMarkRead={markAsRead} />)
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* --- ACTIVITY ITEM (Uden chatbeskeder) --- */
function ActivityItem({ n, onMarkRead }: { n: any, onMarkRead: (id: string) => void }) {
    const d = n.data || {};
    const type = n.type || "";

    const isNewProduct = type === "new_product_from_following";
    const isCounterBid = type.includes("counter");
    const isBid = (type.includes("bid") || type.includes("offer")) && !isCounterBid;
    const isAccepted = type.includes("accepted");

    const getStatusLabel = () => {
        if (isNewProduct) return "New in network";
        if (isAccepted)   return "Bid Accepted!";
        if (isCounterBid) return "Counter-offer received";
        if (isBid)        return "New bid received";
        return "Update";
    };

    const getIcon = () => {
        if (isAccepted)   return <Sparkles size={24} className="text-amber-500" />;
        if (isCounterBid) return <TrendingUp size={24} className="text-blue-600" />;
        if (isBid)        return <DollarSign size={24} className="text-green-600" />;
        if (isNewProduct) return <Package size={24} className="text-[#003d2b]" />;
        return <Bell size={24} className="text-gray-300" />;
    };

    return (
        <div className={`p-6 transition-all ${!n.read ? 'bg-blue-50/40 border-l-4 border-l-blue-600' : 'hover:bg-gray-50/50'}`}>
            <div className="flex items-start gap-5">
                <div className="h-16 w-16 rounded-2xl bg-gray-50 border border-gray-100 shrink-0 overflow-hidden relative shadow-sm">
                    {isNewProduct && d.image ? (
                        <Image src={d.image} alt="Product" fill className="object-cover" />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center">
                            {getIcon()}
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${!n.read ? 'text-blue-600' : 'text-gray-400'}`}>
                            {getStatusLabel()}
                        </span>
                        {!n.read && <div className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />}
                    </div>

                    <h4 className="text-sm font-bold text-black leading-tight mb-1">
                        {n.message || (isNewProduct ? d.title : "Trade Update")}
                    </h4>

                    {(d.bidAmount || d.price || d.bidPrice) && (
                        <p className="text-xs font-black text-green-700">
                            {d.bidAmount || d.price || d.bidPrice} DKK
                        </p>
                    )}

                    <div className="flex flex-wrap gap-4 mt-4 items-center">
                        {d.productId ? (
                            <Link
                                href={`/products/${d.productId}`}
                                onClick={() => onMarkRead(n._id)}
                                className="inline-flex items-center gap-2 bg-black text-white text-[9px] font-black uppercase px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-shadow shadow-lg"
                            >
                                View Product
                                <ArrowRight size={12} />
                            </Link>
                        ) : (
                            <span className="text-[9px] text-gray-300 font-bold uppercase tracking-widest italic">
                                Item no longer available
                            </span>
                        )}

                        {!n.read && (
                            <button
                                onClick={() => onMarkRead(n._id)}
                                className="text-[9px] font-black uppercase text-gray-400 hover:text-black transition-colors"
                            >
                                Mark as read
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* --- CHAT ITEM --- */
function ChatThreadItem({ thread, user }: { thread: any, user: any }) {
    const isSeller = thread.sellerId?._id === user?._id;
    const partner = isSeller ? thread.buyerId : thread.sellerId;

    return (
        <Link href={`/chat/${thread._id}`} className="flex items-center gap-5 p-6 hover:bg-gray-50 transition-all group">
            <div className="relative h-16 w-16 shrink-0 group-hover:scale-95 transition-transform">
                <div className="h-full w-full bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 relative shadow-sm">
                    {thread.productId?.images?.[0] ? (
                        <Image src={`/api/images/products/${thread.productId.images[0]}`} alt="Product" fill className="object-cover" />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-[8px] bg-gray-100 text-gray-400">N/A</div>
                    )}
                </div>
                <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full border-2 border-white overflow-hidden bg-gray-300 shadow-md">
                    <img src={`/api/images${partner?.profile?.avatarUrl || '/avatars/default.jpg'}`} className="h-full w-full object-cover" alt="partner" />
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-sm truncate uppercase tracking-tight text-black">{thread.productId?.title || "Deleted Product"}</h3>
                    <span className="text-[9px] font-mono text-gray-400 uppercase">{new Date(thread.lastMessageAt).toLocaleDateString()}</span>
                </div>
                <p className="text-[11px] text-gray-500 truncate font-medium">Chat with <span className="text-black font-black uppercase">{partner?.username || "Unknown"}</span></p>
            </div>
            <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                <Search size={16} />
            </div>
        </Link>
    );
}

/* --- EMPTY STATE --- */
function EmptyState({ icon, text }: { icon: any, text: string }) {
    return (
        <div className="p-24 text-center">
            <div className="text-gray-200 flex justify-center mb-6 scale-125">{icon}</div>
            <p className="text-gray-400 text-sm font-medium italic mb-8">{text}</p>
            <Link href="/" className="inline-block bg-black text-white text-[10px] font-black uppercase px-10 py-4 rounded-full tracking-widest hover:scale-105 transition-all shadow-xl">
                Explore Marketplace
            </Link>
        </div>
    );
}