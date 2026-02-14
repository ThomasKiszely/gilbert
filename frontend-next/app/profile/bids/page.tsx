"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Gavel, ArrowUpRight, ArrowDownLeft, Loader2, ChevronRight, Inbox } from "lucide-react";
import Link from "next/link";

export default function MyBidsPage() {
    const { user } = useAuth();
    const [bids, setBids] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBids = async () => {
            try {
                const res = await fetch("/api/bids/my-bids");
                const data = await res.json();
                if (data.success) {
                    setBids(data.data);
                }
            } catch (err) {
                console.error("Failed to fetch bids", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBids();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a1f1a] flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 text-[#800020] animate-spin mb-4" />
                <p className="text-[10px] text-[ivory]/20 uppercase tracking-[0.2em] font-black italic">Syncing Negotiations</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a1f1a] p-6 pb-32">
            <header className="mb-10 pt-4">
                <h1 className="text-[ivory] text-3xl font-black uppercase tracking-tighter">Negotiations</h1>
                <p className="text-[ivory]/30 text-[9px] uppercase tracking-[0.3em] mt-1 font-bold">Active bids & offers</p>
            </header>

            <div className="grid gap-4">
                {bids.length === 0 ? (
                    <div className="bg-[#16302b] p-16 rounded-[3rem] border border-white/5 flex flex-col items-center justify-center text-center">
                        <div className="bg-[#0a1f1a] p-5 rounded-full mb-4 shadow-inner">
                            <Inbox className="h-6 w-6 text-[ivory]/10" />
                        </div>
                        <p className="text-[ivory]/40 text-[10px] uppercase font-black tracking-widest">No active negotiations found</p>
                    </div>
                ) : (
                    bids.map((bid) => {
                        // SIKKERHEDS-TJEK: Er brugeren køber eller sælger?
                        const isBuyer = String(bid.buyerId?._id || bid.buyerId) === String(user?._id);

                        // BELØB: Vis modbuddet hvis det findes, ellers det originale bud
                        const displayAmount = bid.status === 'countered' ? bid.counterAmount : bid.amount;

                        // BILLED-STI: Sikrer korrekt URL til din Next.js rewrite
                        const rawImagePath = bid.productId?.images?.[0];
                        const imageSrc = rawImagePath
                            ? (rawImagePath.startsWith('/') ? rawImagePath : `/${rawImagePath}`)
                            : null;

                        return (
                            <Link key={bid._id} href={`/products/${bid.productId?._id}`}>
                                <div className="bg-[#16302b] p-5 rounded-[2.5rem] border border-white/5 hover:border-[#800020]/40 transition-all group relative overflow-hidden active:scale-[0.98]">
                                    <div className="flex items-center gap-5">

                                        {/* Product Thumbnail */}
                                        <div className="h-20 w-20 bg-[#0a1f1a] rounded-2xl overflow-hidden border border-white/5 shrink-0 shadow-2xl">
                                            {imageSrc ? (
                                                <img
                                                    src={imageSrc}
                                                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    alt={bid.productId?.title || "Product"}
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-[#16302b]">
                                                    <Gavel className="h-5 w-5 text-[ivory]/10" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Bid Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                {isBuyer ? (
                                                    <div className="flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded-full">
                                                        <ArrowUpRight className="h-2.5 w-2.5 text-blue-400" />
                                                        <span className="text-blue-400 text-[8px] font-black uppercase tracking-widest">Outgoing</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                                        <ArrowDownLeft className="h-2.5 w-2.5 text-emerald-400" />
                                                        <span className="text-emerald-400 text-[8px] font-black uppercase tracking-widest">Incoming</span>
                                                    </div>
                                                )}
                                                <span className="text-[ivory]/20 text-[8px] font-bold uppercase tracking-widest shrink-0">• {bid.status}</span>
                                            </div>

                                            <h3 className="text-[ivory] text-[13px] font-bold uppercase tracking-tight truncate pr-4">
                                                {bid.productId?.title || "Deleted Product"}
                                            </h3>

                                            <div className="mt-2 flex items-baseline gap-1">
                                                <span className="text-[#800020] text-xl font-black tracking-tighter">{displayAmount}</span>
                                                <span className="text-[9px] text-[ivory]/40 font-black uppercase">DKK</span>
                                            </div>
                                        </div>

                                        {/* Action Icon */}
                                        <div className="bg-white/5 p-3 rounded-2xl group-hover:bg-[#800020] group-hover:text-white transition-all shadow-lg">
                                            <ChevronRight className="h-4 w-4" />
                                        </div>
                                    </div>

                                    {/* Progress Bar Visual (Indikerer hvor langt forhandlingen er) */}
                                    <div className="absolute bottom-0 left-0 h-1 bg-white/5 w-full">
                                        <div
                                            className="h-full bg-[#800020] transition-all duration-1000 ease-out"
                                            style={{ width: bid.status === 'countered' ? '100%' : '50%' }}
                                        ></div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}