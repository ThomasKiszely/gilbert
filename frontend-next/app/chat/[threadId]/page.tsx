"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useParams } from "next/navigation";
import { Send } from "lucide-react";
import { Button } from "@/app/components/UI/button";
import { Input } from "@/app/components/UI/input";

export default function ChatPage() {
    const { threadId } = useParams();
    const { user } = useAuth();
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchMessages = async () => {
        if (!threadId) return;
        try {
            const res = await fetch(`/api/chats/${threadId}/messages`);
            const data = await res.json();

            if (data.success) {
                // Din controller sender listen i 'message' (ental)
                const msgData = data.message;
                const finalArray = Array.isArray(msgData) ? msgData : (msgData ? [msgData] : []);
                setMessages(finalArray);
            }
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 4000);
        return () => clearInterval(interval);
    }, [threadId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await fetch(`/api/chats/${threadId}`, { // threadId fra URL
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: newMessage }),
            });
            setNewMessage("");
            fetchMessages();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading && messages.length === 0) {
        return <div className="flex justify-center mt-40 text-black font-mono text-[10px] tracking-[0.3em] uppercase">Loading Conversation...</div>;
    }

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] max-w-2xl mx-auto bg-white border border-slate-200 rounded-[2rem] overflow-hidden mt-24 mb-6 shadow-2xl shadow-black/5">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-white/80 backdrop-blur-md flex justify-between items-center">
                <span className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Gilbert Chat System</span>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-black">{user?.username}</span>
                    <div className="h-1.5 w-1.5 rounded-full bg-black"></div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#fcfcfc]">
                {messages.map((msg: any, index: number) => {
                    const senderId = msg.senderId?._id || msg.senderId;
                    const isMe = String(senderId) === String(user?._id);

                    return (
                        <div key={msg._id || index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[85%] px-5 py-3 rounded-[1.2rem] text-[13px] leading-relaxed transition-all ${
                                isMe
                                    ? "bg-black text-white rounded-br-none"
                                    : "bg-white border border-slate-200 text-black rounded-bl-none"
                            }`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                                <span className={`text-[8px] mt-2 block font-mono uppercase tracking-widest opacity-30 ${isMe ? "text-right" : "text-left"}`}>
                                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-3 items-center">
                <Input
                    placeholder="Write message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 bg-slate-50 border-none h-12 text-black rounded-2xl px-5 text-sm placeholder:text-slate-300"
                />
                <Button type="submit" size="icon" className="rounded-2xl h-12 w-12 bg-black hover:bg-zinc-800 transition-all shrink-0">
                    <Send className="h-4 w-4 text-white" />
                </Button>
            </form>
        </div>
    );
}