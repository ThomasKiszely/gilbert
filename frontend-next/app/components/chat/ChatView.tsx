"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Send, Gavel, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/app/components/UI/button";
import { Input } from "@/app/components/UI/input";

interface ChatViewProps {
    threadId: string;
    isModal?: boolean;
}

const ChatView = ({ threadId, isModal = false }: ChatViewProps) => {
    const { user } = useAuth();
    const [currentId, setCurrentId] = useState(threadId);
    const [messages, setMessages] = useState<any[]>([]);
    const [activeBid, setActiveBid] = useState<any>(null);
    const [thread, setThread] = useState<any>(null);
    const [newMessage, setNewMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchData = async (isInitial = false) => {
        if (!currentId) return;
        if (isInitial) setIsLoading(true);

        try {
            const timestamp = new Date().getTime();
            const cacheOptions = { cache: 'no-store' as RequestCache };

            // 1. Hent tråd-info (Virker nu med både produkt-ID og tråd-ID)
            const threadRes = await fetch(`/api/chats/threads/${currentId}?t=${timestamp}`, cacheOptions);
            const threadData = await threadRes.json();

            if (threadData.success && threadData.message) {
                setThread(threadData.message);
                // Hvis backenden returnerer et andet ID (det ægte tråd-ID), så opdater staten
                if (threadData.message._id !== currentId) {
                    setCurrentId(threadData.message._id);
                }
            }

            // 2. Hent beskeder (Din backend finder nu selv tråden via produkt-ID hvis nødvendigt)
            const msgRes = await fetch(`/api/chats/${currentId}/messages?t=${timestamp}`, cacheOptions);
            const msgData = await msgRes.json();
            if (msgData.success) {
                setMessages(msgData.message || []);
            }

            // 3. Hent aktivt bud
            const bidRes = await fetch(`/api/bids/active-in-thread/${currentId}?t=${timestamp}`, cacheOptions);
            const bidData = await bidRes.json();
            if (bidData.success) setActiveBid(bidData.bid);

        } catch (err) {
            console.error("ChatView fetch error:", err);
        } finally {
            if (isInitial) setIsLoading(false);
        }
    };

    // Initial load og pollyfill (interval)
    useEffect(() => {
        // Nulstil til det ID vi får ind som prop
        setCurrentId(threadId);
        fetchData(true);

        const interval = setInterval(() => fetchData(false), 5000);
        return () => clearInterval(interval);
    }, [threadId]);

    // Scroll til bund logik
    useEffect(() => {
        if (messages.length > 0) {
            const timer = setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({
                    behavior: isLoading ? "auto" : "smooth",
                    block: "end"
                });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [messages, isLoading]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentId) return;

        try {
            const res = await fetch(`/api/chats/${currentId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: newMessage })
            });

            const data = await res.json();
            if (data.success) {
                setNewMessage("");

                // Opdater ID hvis backenden lige har oprettet tråden
                const realId = data.threadId || data.message?.threadId || data.message?._id;
                if (realId && realId !== currentId) setCurrentId(realId);

                fetchData(false);
                setShowPopup(true);
                setTimeout(() => setShowPopup(false), 2000);
            }
        } catch (err) {
            console.error("Send message error:", err);
        }
    };

    const handleBidAction = async (action: 'accept' | 'reject', bidId: string) => {
        try {
            const res = await fetch(`/api/bids/${bidId}/${action}`, { method: 'POST' });
            if (res.ok) fetchData(false);
        } catch (err) {
            console.error("Bid action error:", err);
        }
    };

    return (
        <div className="flex flex-col w-full h-full bg-[#0a1f1a] relative">
            {/* NOTIFIKATION POPUP */}
            {showPopup && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[110] animate-in fade-in slide-in-from-top-4">
                    <div className="bg-[#800020] text-[ivory] px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 border border-white/10">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Besked sendt</span>
                    </div>
                </div>
            )}

            {/* HEADER */}
            {!isModal && (
                <div className="p-4 border-b border-white/10 bg-[#0a1f1a] flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-[#16302b] rounded-xl overflow-hidden border border-white/5">
                            {thread?.productId?.images?.[0] && (
                                <img
                                    src={`/api/images/products/${thread.productId.images[0]}`}
                                    className="h-full w-full object-cover"
                                    alt="Product"
                                />
                            )}
                        </div>
                        <div>
                            <h2 className="text-[ivory] text-xs font-bold uppercase tracking-tight leading-none mb-1">
                                {thread?.productId?.title || "Henter chat..."}
                            </h2>
                            <p className="text-[9px] text-[ivory]/40 uppercase tracking-widest font-mono">
                                {thread?.productId?.price} DKK
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* AKTIVT BUD PANEL */}
            {activeBid && (
                <div className="mx-6 mt-4 p-4 bg-[#16302b] rounded-2xl border border-white/5 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#800020] p-2 rounded-lg">
                            <Gavel className="h-4 w-4 text-[ivory]" />
                        </div>
                        <div>
                            <p className="text-[9px] font-mono uppercase text-[ivory]/40">Aktivt Bud</p>
                            <p className="text-sm font-bold text-[ivory]">
                                {activeBid.status === 'countered' ? activeBid.counterAmount : activeBid.amount} DKK
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => handleBidAction('accept', activeBid._id)} className="bg-[ivory] text-[#0a1f1a] hover:bg-white text-[10px] px-3 py-1 h-8 rounded-lg uppercase font-bold transition-colors">Accept</Button>
                        <Button onClick={() => handleBidAction('reject', activeBid._id)} variant="ghost" className="text-[ivory]/40 hover:text-red-400 text-[10px] uppercase font-bold transition-colors">Afvis</Button>
                    </div>
                </div>
            )}

            {/* BESKED-STRØM */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                {isLoading ? (
                    <div className="h-full w-full flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="h-8 w-8 text-[#16302b] animate-spin" />
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[ivory]/20 font-medium">Synkroniserer historik</p>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, i) => {
                            const isSystem = msg.text.startsWith("SYSTEM_BID:");
                            const displayChatText = isSystem ? msg.text.replace("SYSTEM_BID:", "") : msg.text;
                            const isMine = String(msg.senderId?._id || msg.senderId) === String(user?._id);

                            if (isSystem) {
                                return (
                                    <div key={i} className="flex justify-center my-4 animate-in fade-in zoom-in-95 duration-500">
                                        <div className="bg-[#16302b]/50 border border-white/5 px-4 py-1.5 rounded-full">
                                            <p className="text-[9px] font-mono uppercase tracking-widest text-[ivory]/40 flex items-center gap-2">
                                                <Gavel className="h-3 w-3" /> {displayChatText}
                                            </p>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div key={i} className={`flex ${isMine ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm shadow-sm transition-all ${
                                        isMine
                                            ? "bg-[#800020] text-[ivory] rounded-br-none"
                                            : "bg-[#16302b] text-[ivory] rounded-bl-none border border-white/5"
                                    }`}>
                                        <p className="leading-relaxed whitespace-pre-wrap">{displayChatText}</p>
                                        <span className="text-[9px] opacity-30 block mt-2 text-right font-mono">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} className="h-px w-full" aria-hidden="true" />
                    </>
                )}
            </div>

            {/* INPUT FORM */}
            <form onSubmit={handleSendMessage} className="p-6 bg-[#0a1f1a] border-t border-white/10 flex gap-3">
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Skriv din besked her..."
                    className="flex-1 bg-[#16302b] border-none text-[ivory] placeholder:text-[ivory]/30 h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-[#800020] transition-all"
                />
                <Button
                    type="submit"
                    disabled={!newMessage.trim() || isLoading}
                    className="bg-[#800020] hover:bg-[#600018] h-12 w-12 rounded-xl shrink-0 shadow-lg disabled:opacity-30 transition-all active:scale-90"
                >
                    <Send className="h-5 w-5 text-[ivory]" />
                </Button>
            </form>
        </div>
    );
};

export default ChatView;