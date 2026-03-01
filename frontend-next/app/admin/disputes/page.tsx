'use client';

import { useEffect, useState } from "react";
import { api } from "@/app/api/api";
import Link from "next/link";
import {
    Gavel,
    AlertCircle,
    ChevronRight,
    PackageSearch,
    ArrowLeft,
    Clock,
    ShieldCheck
} from "lucide-react";

export default function AdminDisputesPage() {
    const [disputes, setDisputes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDisputes();
    }, []);

    async function loadDisputes() {
        try {
            // Fetching orders with status 'disputed' or 'awaiting_return'
            const res = await api('/api/admin/orders?status=disputed,awaiting_return');
            const data = await res.json();
            if (data.success) {
                setDisputes(data.data);
            }
        } catch (err) {
            console.error("Error fetching disputes:", err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div className="p-20 text-center italic text-racing-green font-serif">Loading active cases...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6 mt-10 mb-20 font-sans text-racing-green">

            {/* BACK LINK */}
            <Link
                href="/admin"
                className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-zinc-400 hover:text-racing-green transition mb-12 font-black"
            >
                <ArrowLeft size={14} /> Dashboard
            </Link>

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Gavel className="text-burgundy" size={32} />
                        <h1 className="text-5xl font-serif font-black italic">Dispute Center</h1>
                    </div>
                    <p className="text-sm text-zinc-500 mt-2 font-medium italic">
                        Management of ongoing disputes and return cases
                    </p>
                </div>

                {disputes.length > 0 && (
                    <div className="bg-racing-green text-ivory px-8 py-4 rounded-[2rem] shadow-xl flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[9px] uppercase tracking-widest opacity-60 font-bold">Active Cases</p>
                            <p className="text-2xl font-black font-serif italic">{disputes.length}</p>
                        </div>
                        <div className="w-px h-8 bg-white/20" />
                        <div className="text-right">
                            <p className="text-[9px] uppercase tracking-widest opacity-60 font-bold">Total Value</p>
                            <p className="text-2xl font-black font-serif italic">
                                {disputes.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0)} DKK
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* DISPUTE LIST */}
            {disputes.length === 0 ? (
                <div className="bg-ivory border border-ivory-dark rounded-[3.5rem] p-32 text-center shadow-inner">
                    <div className="w-20 h-20 bg-white border border-ivory-dark text-zinc-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
                        <ShieldCheck size={40} />
                    </div>
                    <h2 className="text-2xl font-serif font-bold italic">Everything is under control</h2>
                    <p className="text-zinc-400 text-sm mt-2">There are no active disputes in the system at the moment.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {disputes.map((order) => (
                        <Link
                            key={order._id}
                            href={`/admin/orders/${order._id}`}
                            className="group bg-white border border-ivory-dark p-8 rounded-[2.5rem] hover:shadow-2xl hover:border-burgundy/20 transition-all duration-500 flex flex-col lg:flex-row items-center gap-8"
                        >
                            {/* STATUS ICON */}
                            <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-inner transition-transform group-hover:scale-105 duration-500 ${
                                order.status === 'disputed'
                                    ? 'bg-burgundy/5 text-burgundy'
                                    : 'bg-zinc-900 text-ivory'
                            }`}>
                                {order.status === 'disputed' ? <AlertCircle size={32} /> : <PackageSearch size={32} />}
                            </div>

                            {/* INFO SECTION */}
                            <div className="flex-1 text-center lg:text-left">
                                <div className="flex flex-wrap justify-center lg:justify-start items-center gap-3 mb-3">
                                    <span className="text-[10px] font-mono font-bold text-zinc-400 bg-zinc-50 px-2 py-1 rounded">
                                        #{order._id.slice(-6).toUpperCase()}
                                    </span>
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
                                        order.status === 'disputed'
                                            ? 'bg-burgundy text-white shadow-lg shadow-burgundy/20'
                                            : 'bg-zinc-800 text-white'
                                    }`}>
                                        {order.status === 'disputed' ? 'Dispute Opened' : 'Awaiting Return'}
                                    </span>
                                    <span className="flex items-center gap-1 text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">
                                        <Clock size={12} /> {new Date(order.createdAt).toLocaleDateString('en-GB')}
                                    </span>
                                </div>

                                <h3 className="font-serif font-black text-racing-green text-2xl italic group-hover:text-burgundy transition-colors duration-300">
                                    {order.product?.title || 'Unknown Product'}
                                </h3>

                                {order.disputeReason && (
                                    <p className="text-xs text-zinc-500 italic mt-3 line-clamp-1 border-l-2 border-ivory-dark pl-4 py-1 max-w-xl mx-auto lg:mx-0">
                                        "{order.disputeReason}"
                                    </p>
                                )}
                            </div>

                            {/* DATA SECTION */}
                            <div className="flex items-center gap-12 px-10 border-t lg:border-t-0 lg:border-l border-ivory-dark pt-6 lg:pt-0 w-full lg:w-auto justify-around">
                                <div className="text-center lg:text-right">
                                    <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold mb-1 italic">Order Value</p>
                                    <p className="text-2xl font-black flex items-center justify-center lg:justify-end gap-1 font-serif italic">
                                        {order.totalAmount} <span className="text-xs font-sans not-italic">DKK</span>
                                    </p>
                                </div>

                                <div className="w-14 h-14 rounded-full bg-ivory flex items-center justify-center text-zinc-300 group-hover:bg-racing-green group-hover:text-white group-hover:translate-x-2 transition-all duration-500 shadow-sm">
                                    <ChevronRight size={24} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* FOOTER INFO */}
            <div className="mt-20 p-10 bg-ivory/50 rounded-[3rem] border border-ivory-dark border-dashed text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 italic">
                    Reminder: As an administrator, your decision is final. Always verify tracking and email history before issuing a refund.
                </p>
            </div>
        </div>
    );
}