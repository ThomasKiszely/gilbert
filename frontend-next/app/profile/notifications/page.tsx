"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import { Search, MessageSquare } from "lucide-react";

export default function InboxPage() {
    const { user } = useAuth();
    const [threads, setThreads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchThreads = async () => {
            try {
                const res = await fetch("/api/chats/threads");
                const data = await res.json();
                if (data.success) {
                    setThreads(data.message);
                }
            } catch (err) {
                console.error("Fejl ved hentning af tråde:", err);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchThreads();
    }, [user]);

    if (loading) return <div className="mt-40 text-center font-mono text-[10px] uppercase tracking-widest">Henter dine samtaler...</div>;

    return (
        <div className="max-w-4xl mx-auto mt-24 px-4 mb-20">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter">Inbox</h1>
                    <p className="text-slate-400 text-xs font-mono uppercase tracking-widest">Dine beskeder & bud</p>
                </div>
                <div className="text-right hidden sm:block">
                    <span className="text-[10px] font-bold px-3 py-1 bg-slate-100 rounded-full uppercase tracking-widest text-slate-500">
                        {threads.length} Aktive tråde
                    </span>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-xl shadow-black/5">
                {threads.length === 0 ? (
                    <div className="p-20 text-center">
                        <MessageSquare className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 text-sm">No messages yet.</p>
                        <Link href="/frontend-next/public" className="text-black text-xs font-bold uppercase underline mt-4 block">Find noget at købe</Link>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {threads.map((thread) => {
                            // Find ud af om brugeren er køber eller sælger i denne tråd
                            const isSeller = thread.sellerId?._id === user?._id;
                            const partner = isSeller ? thread.buyerId : thread.sellerId;

                            return (
                                <Link
                                    href={`/chat/${thread._id}`}
                                    key={thread._id}
                                    className="flex items-center gap-4 p-6 hover:bg-slate-50 transition-all group"
                                >
                                    {/* Produkt Billede med Avatar Overlay */}
                                    <div className="relative h-16 w-16 flex-shrink-0 group-hover:scale-95 transition-transform">
                                        <div className="h-full w-full bg-slate-100 rounded-2xl overflow-hidden border border-slate-100">
                                            {thread.productId?.images?.[0] ? (
                                                <img
                                                    src={`/api/images/products/${thread.productId.images[0]}`}
                                                    className="h-full w-full object-cover"
                                                    alt="Produkt"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-[8px] font-mono text-slate-300">NO IMG</div>
                                            )}
                                        </div>

                                        {/* PARTNER AVATAR OVERLAY */}
                                        <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full border-2 border-white overflow-hidden bg-slate-200 shadow-sm">
                                            <img
                                                src={`/api/images${partner?.profile?.avatarUrl || '/avatars/Gilbert.jpg'}`}
                                                className="h-full w-full object-cover"
                                                alt="partner"
                                            />
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0 ml-2">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-sm truncate uppercase tracking-tight text-black">
                                                {thread.productId?.title || "Slettet produkt"}
                                            </h3>
                                            <span className="text-[9px] font-mono text-slate-400 uppercase">
                    {new Date(thread.lastMessageAt).toLocaleDateString()}
                </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 truncate font-medium">
                                            Chat med <span className="text-black font-bold uppercase tracking-tighter">{partner?.username || "Ukendt bruger"}</span>
                                        </p>
                                    </div>

                                    {/* Pil / Indikator */}
                                    <div className="pl-4">
                                        <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                                            <Search className="h-3 w-3" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}