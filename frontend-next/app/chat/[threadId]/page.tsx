"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useParams } from "next/navigation";
import { Send, Gavel, Check, X, ChevronRight } from "lucide-react";
import { Button } from "@/app/components/UI/button";
import Link from "next/link";

export default function ChatPage() {
    const { threadId } = useParams();
    const { user } = useAuth();
    const [messages, setMessages] = useState<any[]>([]);
    const [activeBid, setActiveBid] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [thread, setThread] = useState<any>(null); // Ny state til tråd-info

    const fetchData = async () => {
        if (!threadId) return;
        try {
            // 1. Hent selve tråden (for at få produkt-detaljer)
            const threadRes = await fetch(`/api/chats/threads/${threadId}`); // Du skal have en rute til ChatThread.findById(threadId)
            const threadData = await threadRes.json();
            if (threadData.success) {
                setThread(threadData.message);
            }

            // 2. Hent beskeder (eksisterende logik)
            const msgRes = await fetch(`/api/chats/${threadId}/messages`);
            const msgData = await msgRes.json();
            if (msgData.success) {
                setMessages(msgData.message);
            }

            // 3. Hent aktivt bud (eksisterende logik)
            const bidRes = await fetch(`/api/bids/active-in-thread/${threadId}`);
            const bidData = await bidRes.json();
            if (bidData.success) setActiveBid(bidData.bid);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleBidAction = async (action: 'accept' | 'reject', bidId: string) => {
        try {
            const res = await fetch(`/api/bids/${bidId}/${action}`, { method: 'POST' });
            if (res.ok) {
                // Refresh data med det samme så bud-kortet forsvinder/opdateres
                fetchData();
            }
        } catch (err) {
            console.error("Kunne ikke udføre handling på bud:", err);
        }
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault(); // Forhindrer siden i at refreshe hvis du bruger en <form>
        if (!newMessage.trim() || !threadId) return;

        try {
            const res = await fetch(`/api/chats/${threadId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: newMessage })
            });

            const data = await res.json();
            if (data.success) {
                setNewMessage(""); // Tøm feltet
                fetchData(); // Hent de nye beskeder med det samme
            }
        } catch (err) {
            console.error("Kunne ikke sende besked:", err);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [threadId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] max-w-2xl mx-auto bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden mt-24 mb-6 shadow-2xl">
            {/* Header med produkt-info */}
            <div className="p-5 border-b border-slate-100 bg-white flex justify-between items-center">
                <div className="flex items-center gap-4">
                    {/* Produkt Billede */}
                    <div className="h-12 w-12 bg-slate-100 rounded-2xl overflow-hidden border border-slate-100 shrink-0">
                        {thread?.productId?.images?.[0] ? (
                            <img
                                src={`/api/images/products/${thread.productId.images[0]}`}
                                className="h-full w-full object-cover"
                                alt="Product"
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-[8px] font-mono text-slate-300">IMG</div>
                        )}
                    </div>

                    {/* Titel og Partner Info */}
                    <div className="min-w-0">
                        <h2 className="text-sm font-black text-black uppercase tracking-tight truncate leading-none mb-1">
                            {thread?.productId?.title || "Loading..."}
                        </h2>
                        <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-slate-400">
                            {thread?.productId?.price} DKK — Chat with <span className="text-black font-bold">
                    {/* Sikker tjek af partner navn */}
                            {thread ? (
                                String(user?._id) === String(thread.sellerId?._id || thread.sellerId)
                                    ? thread.buyerId?.username
                                    : thread.sellerId?.username
                            ) : "..."}
                </span>
                        </p>
                    </div>
                </div>

                {/* Link til produktet */}
                {thread?.productId?._id && (
                    <Link
                        href={`/products/${thread.productId._id}`}
                        className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                )}
            </div>

            {/* BUD SEKTION - Vises kun hvis der er et activeBid */}
            {activeBid && (
                <div className="mx-6 mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <div className="bg-black p-2 rounded-lg">
                            <Gavel className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <p className="text-[9px] font-mono uppercase text-slate-400 tracking-tighter">
                                {activeBid.status === 'countered' ? 'Counter Offer' : 'Current Bid'}
                            </p>
                            <p className="text-sm font-black text-black">
                                {activeBid.status === 'countered' ? activeBid.counterAmount : activeBid.amount} DKK
                            </p>
                        </div>
                    </div>

                    {/* Knapper vises kun for modtageren af buddet (Sælger ved nyt bud, Køber ved modbud) */}
                    <div className="flex gap-2">
                        <Button
                            onClick={() => handleBidAction('accept', activeBid._id)}
                            className="bg-black hover:bg-zinc-800 text-white text-[10px] px-4 py-2 rounded-xl h-auto uppercase font-bold"
                        >
                            Accept
                        </Button>
                        <Button
                            onClick={() => handleBidAction('reject', activeBid._id)}
                            variant="ghost"
                            className="text-slate-400 hover:text-red-500 text-[10px] uppercase font-bold"
                        >
                            Decline
                        </Button>
                    </div>
                </div>
            )}

            {/* Beskeder */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, i) => {
                    const isSystem = msg.text.startsWith("SYSTEM_BID:");
                    const displayChatText = isSystem ? msg.text.replace("SYSTEM_BID:", "") : msg.text;

                    if (isSystem) {
                        return (
                            <div key={i} className="flex justify-center my-4">
                                <div className="bg-slate-50 border border-slate-100 px-4 py-1.5 rounded-full">
                                    <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <Gavel className="h-3 w-3" /> {displayChatText}
                                    </p>
                                </div>
                            </div>
                        );
                    }

                    const isMine = String(msg.senderId?._id || msg.senderId) === String(user?._id);

                    return (
                        <div key={i} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[80%] px-5 py-3 rounded-[1.5rem] text-[13px] shadow-sm ${
                                isMine ? "bg-black text-white rounded-br-none" : "bg-slate-100 text-black rounded-bl-none"
                            }`}>
                                {displayChatText}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Simpel Besked Input Form */}
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                }}
                className="p-6 bg-white border-t border-slate-50"
            >
                <div className="flex gap-2">
                    <input
                        className="flex-1 bg-slate-50 border-none rounded-2xl px-4 text-sm focus:ring-1 focus:ring-black transition-all text-black"
                        placeholder="Write your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        // Vi fjerner den manuelle handleSendMessage herfra for at lade formen styre det
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                // Vi gør intet her, da onSubmit på formen fanger det automatisk
                            }
                        }}
                    />
                    <Button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="rounded-2xl bg-black hover:bg-zinc-800 w-12 h-12 p-0 flex items-center justify-center disabled:opacity-50 transition-all shrink-0"
                    >
                        <Send className="h-4 w-4 text-white" />
                    </Button>
                </div>
            </form>
        </div>
    );
}