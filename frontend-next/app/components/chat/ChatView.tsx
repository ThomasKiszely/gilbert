"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Send, Gavel, CheckCircle2, Loader2, X, Clock } from "lucide-react";
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

    // Counter bid states
    const [isCountering, setIsCountering] = useState(false);
    const [counterAmount, setCounterAmount] = useState("");

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchData = async (isInitial = false) => {
        if (!currentId) return;
        if (isInitial) setIsLoading(true);

        try {
            const timestamp = new Date().getTime();
            const cacheOptions = { cache: 'no-store' as RequestCache };

            const threadRes = await fetch(`/api/chats/threads/${currentId}?t=${timestamp}`, cacheOptions);
            const threadData = await threadRes.json();

            if (threadData.success && threadData.message) {
                setThread(threadData.message);
                if (threadData.message._id !== currentId) {
                    setCurrentId(threadData.message._id);
                }
            }

            const msgRes = await fetch(`/api/chats/${currentId}/messages?t=${timestamp}`, cacheOptions);
            const msgData = await msgRes.json();
            if (msgData.success) {
                setMessages(msgData.message || []);
            }

            const bidRes = await fetch(`/api/bids/active-in-thread/${currentId}?t=${timestamp}`, cacheOptions);
            const bidData = await bidRes.json();
            if (bidData.success) setActiveBid(bidData.bid);
            else setActiveBid(null);

        } catch (err) {
            console.error("ChatView fetch error:", err);
        } finally {
            if (isInitial) setIsLoading(false);
        }
    };

    useEffect(() => {
        setCurrentId(threadId);
        fetchData(true);
        const interval = setInterval(() => fetchData(false), 5000);
        return () => clearInterval(interval);
    }, [threadId]);

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
                fetchData(false);
            }
        } catch (err) {
            console.error("Send message error:", err);
        }
    };

    const handleBidAction = async (action: 'accept' | 'reject' | 'accept-counter' | 'reject-counter', bidId: string) => {
        try {
            const res = await fetch(`/api/bids/${bidId}/${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                fetchData(false);
                setShowPopup(true);
                setTimeout(() => setShowPopup(false), 2000);
            }
        } catch (err) {
            console.error("Bid Action Error:", err);
        }
    };

    const handleCounterBid = async () => {
        if (!counterAmount || isNaN(Number(counterAmount)) || !activeBid) return;

        try {
            const res = await fetch(`/api/bids/${activeBid._id}/counter`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ counterAmount: Number(counterAmount) })
            });

            if (res.ok) {
                setIsCountering(false);
                setCounterAmount("");
                await fetchData(false);
                setShowPopup(true);
                setTimeout(() => setShowPopup(false), 2000);
            } else {
                const errorData = await res.json();
                alert(errorData.message || "Could not send counter bid");
            }
        } catch (err) {
            console.error("Counter bid error:", err);
        }
    };

    return (
        <div className="flex flex-col w-full h-full bg-[#0a1f1a] relative font-sans">
            {showPopup && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[110] animate-in fade-in slide-in-from-top-4">
                    <div className="bg-[#800020] text-[ivory] px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-white/20">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Update Successful</span>
                    </div>
                </div>
            )}

            {/* HEADER (Only shown if not in modal) */}
            {!isModal && (
                <div className="p-6 border-b border-white/10 bg-[#0a1f1a] flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-[#16302b] rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                            {thread?.productId?.images?.[0] && (
                                <img src={thread.productId.images[0]} className="h-full w-full object-cover" alt="Product" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-[ivory] text-sm font-bold uppercase tracking-tight mb-0.5">
                                {thread?.productId?.title || "Loading..."}
                            </h2>
                            <p className="text-[10px] text-[#800020] font-black uppercase tracking-widest">
                                {thread?.productId?.price} DKK
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ACTION PANEL (The Bid Manager) */}
            {activeBid && (
                <div className="mx-6 mt-4 p-6 bg-[#16302b] rounded-[2rem] border border-white/5 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div className="bg-[#800020] p-3 rounded-2xl shadow-inner">
                                <Gavel className="h-4 w-4 text-[ivory]" />
                            </div>
                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[ivory]/40 mb-1">
                                    {activeBid.status === 'countered' ? 'Counter Offer Received' : 'Current Active Bid'}
                                </p>
                                <p className="text-2xl font-black text-[ivory] leading-none tracking-tight">
                                    {activeBid.status === 'countered' ? activeBid.counterAmount : activeBid.amount} <span className="text-[10px] text-[ivory]/40 ml-1">DKK</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <span className="bg-red-500/10 text-red-400 text-[8px] font-bold px-2 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                                <Clock className="h-2 w-2" /> Expires soon
                            </span>
                        </div>
                    </div>

                    {!isCountering ? (
                        <div className="grid grid-cols-2 gap-3">
                            {/* SELLER ACTIONS */}
                            {activeBid.status === 'active' && String(user?._id) === String(thread?.sellerId?._id || thread?.sellerId) && (
                                <>
                                    <Button onClick={() => handleBidAction('accept', activeBid._id)} className="bg-[ivory] text-[#0a1f1a] hover:bg-white text-[10px] h-12 rounded-xl uppercase font-black transition-all active:scale-95 shadow-lg">
                                        Accept Bid
                                    </Button>
                                    <Button onClick={() => setIsCountering(true)} variant="outline" className="text-[ivory] border-white/20 hover:bg-white/5 text-[10px] h-12 rounded-xl uppercase font-black transition-all">
                                        Counter
                                    </Button>
                                    <button onClick={() => handleBidAction('reject', activeBid._id)} className="col-span-2 text-[ivory]/30 hover:text-red-400 text-[9px] mt-2 uppercase font-black tracking-widest transition-colors">
                                        Decline offer
                                    </button>
                                </>
                            )}
                            {/* BUYER ACTIONS */}
                            {activeBid.status === 'countered' && String(user?._id) === String(thread?.buyerId?._id || thread?.buyerId) && (
                                <>
                                    <Button onClick={() => handleBidAction('accept-counter', activeBid._id)} className="bg-[ivory] text-[#0a1f1a] hover:bg-white text-[10px] h-12 rounded-xl uppercase font-black shadow-lg">
                                        Accept Counter
                                    </Button>
                                    <Button onClick={() => handleBidAction('reject-counter', activeBid._id)} variant="ghost" className="text-red-400/60 hover:text-red-400 text-[10px] h-12 rounded-xl uppercase font-black">
                                        Decline
                                    </Button>
                                </>
                            )}
                        </div>
                    ) : (
                        /* COUNTER INPUT MODE */
                        <div className="flex flex-col gap-2 animate-in slide-in-from-right-4 duration-300">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        type="number"
                                        value={counterAmount}
                                        onChange={(e) => setCounterAmount(e.target.value)}
                                        placeholder="Enter new price..."
                                        className="bg-[#0a1f1a] border-white/10 text-[ivory] h-12 text-sm pl-4 pr-12 rounded-xl focus-visible:ring-[#800020] border-2"
                                        autoFocus
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-[ivory]/20 uppercase">DKK</span>
                                </div>
                                <Button onClick={handleCounterBid} className="bg-[#800020] hover:bg-[#600018] text-[ivory] text-[10px] px-6 h-12 rounded-xl uppercase font-black shadow-lg transition-all active:scale-95">
                                    Send
                                </Button>
                                <Button onClick={() => setIsCountering(false)} variant="ghost" className="p-2 h-12 text-[ivory]/40">
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* STATUS MESSAGES */}
                    {((activeBid.status === 'active' && String(user?._id) === String(thread?.buyerId?._id || thread?.buyerId)) ||
                        (activeBid.status === 'countered' && String(user?._id) === String(thread?.sellerId?._id || thread?.sellerId))) && !isCountering && (
                        <div className="flex items-center justify-center gap-2 py-3 border-t border-white/5 mt-4">
                            <div className="h-1.5 w-1.5 bg-[#800020] rounded-full animate-pulse" />
                            <p className="text-[9px] text-[ivory]/30 uppercase tracking-[0.2em] font-black">Waiting for response</p>
                        </div>
                    )}
                </div>
            )}

            {/* MESSAGES AREA */}
            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 scrollbar-hide">
                {isLoading ? (
                    <div className="h-full w-full flex flex-col items-center justify-center space-y-4 opacity-20">
                        <Loader2 className="h-10 w-10 text-[ivory] animate-spin" />
                        <p className="text-[10px] uppercase tracking-[0.3em] font-black text-[ivory]">Authenticating</p>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, i) => {
                            const isSystem = msg.text.startsWith("SYSTEM_BID:");
                            const displayChatText = isSystem ? msg.text.replace("SYSTEM_BID:", "") : msg.text;
                            const isMine = String(msg.senderId?._id || msg.senderId) === String(user?._id);

                            if (isSystem) {
                                return (
                                    <div key={i} className="flex justify-center my-6">
                                        <div className="bg-[#16302b]/40 backdrop-blur-sm border border-white/5 px-6 py-2 rounded-full shadow-sm">
                                            <p className="text-[8px] font-black uppercase tracking-[0.25em] text-[ivory]/40 flex items-center gap-3">
                                                <Gavel className="h-3 w-3 text-[#800020]" /> {displayChatText}
                                            </p>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div key={i} className={`flex ${isMine ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                    <div className={`max-w-[75%] p-4 rounded-2xl shadow-lg ${
                                        isMine
                                            ? "bg-[#800020] text-[ivory] rounded-br-none"
                                            : "bg-[#16302b] text-[ivory] rounded-bl-none border border-white/5"
                                    }`}>
                                        <p className="text-[13px] leading-relaxed font-medium">{displayChatText}</p>
                                        <span className="text-[8px] opacity-30 block mt-2 font-black uppercase tracking-widest text-right">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} className="h-4 w-full" />
                    </>
                )}
            </div>

            {/* MESSAGE INPUT BAR */}
            <form onSubmit={handleSendMessage} className="p-6 bg-[#0a1f1a] border-t border-white/10 flex gap-3 pb-10">
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-[#16302b] border-none text-[ivory] h-14 px-6 rounded-2xl text-sm focus-visible:ring-1 focus-visible:ring-[#800020]"
                />
                <Button
                    type="submit"
                    disabled={!newMessage.trim() || isLoading}
                    className="bg-[#800020] hover:bg-[#600018] h-14 w-14 rounded-2xl shrink-0 transition-all active:scale-90 shadow-xl"
                >
                    <Send className="h-5 w-5 text-[ivory]" />
                </Button>
            </form>
        </div>
    );
};

export default ChatView;