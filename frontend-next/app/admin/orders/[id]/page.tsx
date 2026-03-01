'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/app/api/api";
import {
    ArrowLeft,
    AlertCircle,
    RefreshCw,
    Gavel,
    PackageSearch,
    X,
    ShieldCheck,
    User,
    Truck,
    CreditCard
} from "lucide-react";

export default function AdminOrderDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const [showResolveModal, setShowResolveModal] = useState(false);
    const [modalMode, setModalMode] = useState<'resolve' | 'return'>('resolve');
    const [adminNote, setAdminNote] = useState("");

    useEffect(() => {
        loadOrder();
    }, [id]);

    async function loadOrder() {
        try {
            const res = await api(`/api/admin/orders/${id}`);
            const data = await res.json();
            if (data.success) setOrder(data.data);
        } catch (err) {
            console.error("Fejl ved hentning af ordre", err);
        } finally {
            setLoading(false);
        }
    }

    async function handleRetryShipping() {
        if (!confirm("Vil du forsøge at generere en ny fragtlabel?")) return;
        setIsActionLoading(true);
        try {
            const res = await api(`/api/admin/orders/${id}/retry-shipping`, { method: "POST" });
            if (res.ok) {
                alert("Fragtlabel forsøges genoprettet.");
                await loadOrder();
            }
        } finally {
            setIsActionLoading(false);
        }
    }

    async function handleRequestReturn() {
        if (!adminNote.trim()) return alert("Du skal angive en begrundelse til køberen.");
        setIsActionLoading(true);
        try {
            const res = await api(`/api/admin/orders/${id}/request-return`, {
                method: "POST",
                body: JSON.stringify({ reason: adminNote }) // Matcher backend 'reason'
            });
            if (res.ok) {
                setOrder((prev: any) => ({ ...prev, status: 'awaiting_return' }));
                setShowResolveModal(false);
                setAdminNote("");
                alert("Anmodning om retur er sendt til køber.");
            }
        } finally {
            setIsActionLoading(false);
        }
    }

    async function handleResolve(decision: 'refund_buyer' | 'payout_seller') {
        if (!adminNote.trim()) return alert("Du skal angive en begrundelse.");
        setIsActionLoading(true);
        try {
            const res = await api(`/api/admin/orders/${id}/resolve-dispute`, {
                method: "POST",
                body: JSON.stringify({
                    resolution: decision, // Matcher backend 'resolution'
                    reason: adminNote      // Matcher backend 'reason'
                })
            });

            if (res.ok) {
                setOrder((prev: any) => ({
                    ...prev,
                    status: decision === 'refund_buyer' ? 'cancelled' : 'completed',
                    disputeReason: null
                }));
                setShowResolveModal(false);
                setAdminNote("");
                alert("Tvist afgjort!");
            }
        } finally {
            setIsActionLoading(false);
        }
    }

    if (loading) return <div className="p-20 text-center italic text-racing-green font-serif">Indlæser sag...</div>;
    if (!order) return <div className="p-20 text-center text-red-600 font-bold">Ordren blev ikke fundet.</div>;

    const currentStatus = order.status?.toLowerCase() || "";
    const isOrderOpen = currentStatus !== 'completed' && currentStatus !== 'cancelled';
    const showDisputeButtons = isOrderOpen && (currentStatus === 'disputed' || currentStatus === 'awaiting_return');
    const showShippingRetry = isOrderOpen && !!order.shippingError;

    return (
        <div className="max-w-6xl mx-auto p-6 mt-10 mb-20 font-sans text-racing-green">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-400 hover:text-racing-green transition mb-8 font-bold text-[10px] uppercase tracking-widest">
                <ArrowLeft size={14} /> Tilbage til oversigt
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* VENSTRE KOLONNE: INFO */}
                <div className="lg:col-span-2 space-y-8">

                    {/* PRODUKT & STATUS */}
                    <section className="bg-ivory p-10 rounded-[3rem] border border-ivory-dark shadow-sm">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-tighter">ORDRE ID: {order._id.toUpperCase()}</span>
                                <h1 className="text-4xl font-serif font-black italic mt-2">{order.product?.title || "Produkt"}</h1>
                            </div>
                            <div className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                currentStatus === 'disputed' ? 'bg-burgundy text-white animate-pulse' :
                                    currentStatus === 'awaiting_return' ? 'bg-zinc-800 text-white' :
                                        currentStatus === 'completed' ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'
                            }`}>
                                {order.status}
                            </div>
                        </div>

                        {order.disputeReason && (
                            <div className="mb-10 p-8 bg-burgundy/5 border-l-4 border-burgundy rounded-r-3xl">
                                <h4 className="text-[10px] font-black text-burgundy uppercase flex items-center gap-2 mb-3 tracking-widest italic">
                                    <AlertCircle size={16} /> Købers officielle indsigelse:
                                </h4>
                                <p className="text-lg italic leading-relaxed font-serif text-zinc-700">"{order.disputeReason}"</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-ivory-dark/50">
                            <div>
                                <h4 className="text-[10px] font-bold uppercase text-zinc-400 mb-2 tracking-widest flex items-center gap-2">
                                    <CreditCard size={12} /> Beløb
                                </h4>
                                <p className="text-2xl font-black">{order.totalAmount} DKK</p>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold uppercase text-zinc-400 mb-2 tracking-widest flex items-center gap-2">
                                    <Truck size={12} /> Fragt Status
                                </h4>
                                <p className="text-sm font-bold">{order.shippingTrackingNumber ? 'Label genereret' : 'Mangler label'}</p>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold uppercase text-zinc-400 mb-2 tracking-widest flex items-center gap-2">
                                    <AlertCircle size={12} /> Fejl log
                                </h4>
                                <p className="text-[10px] font-medium text-red-500 break-words">{order.shippingError || 'Ingen fejl registreret'}</p>
                            </div>
                        </div>
                    </section>

                    {/* PARTER I HANDLEN */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white border border-ivory-dark p-8 rounded-[2.5rem]">
                            <h4 className="text-[10px] font-black uppercase text-zinc-400 mb-6 tracking-widest flex items-center gap-2 italic">
                                <User size={14} /> Sælger Information
                            </h4>
                            <p className="font-serif font-bold text-xl">{order.seller?.username}</p>
                            <p className="text-sm text-zinc-500 mt-1">{order.seller?.email}</p>
                            <p className="text-[10px] font-mono mt-4 text-zinc-400">ID: {order.seller?._id}</p>
                        </div>
                        <div className="bg-white border border-ivory-dark p-8 rounded-[2.5rem]">
                            <h4 className="text-[10px] font-black uppercase text-zinc-400 mb-6 tracking-widest flex items-center gap-2 italic">
                                <User size={14} /> Køber Information
                            </h4>
                            <p className="font-serif font-bold text-xl">{order.buyer?.username}</p>
                            <p className="text-sm text-zinc-500 mt-1">{order.buyer?.email}</p>
                            <p className="text-[10px] font-mono mt-4 text-zinc-400">ID: {order.buyer?._id}</p>
                        </div>
                    </div>
                </div>

                {/* HØJRE KOLONNE: OPERATIONS */}
                <div className="space-y-6">
                    <div className="bg-racing-green text-ivory p-8 rounded-[3rem] shadow-xl sticky top-10">
                        <h3 className="font-bold mb-8 uppercase text-[10px] tracking-[0.2em] border-b border-white/10 pb-4 italic text-center text-white/60">Admin Desk</h3>

                        <div className="space-y-4">
                            {showDisputeButtons && (
                                <>
                                    <button
                                        onClick={() => { setModalMode('return'); setShowResolveModal(true); }}
                                        disabled={isActionLoading || currentStatus === 'awaiting_return'}
                                        className={`w-full py-5 bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-3 ${currentStatus === 'awaiting_return' ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
                                    >
                                        <PackageSearch size={18} />
                                        {currentStatus === 'awaiting_return' ? "Retur anmodet" : "Anmod om Retur"}
                                    </button>

                                    <button
                                        onClick={() => { setModalMode('resolve'); setShowResolveModal(true); }}
                                        className="w-full py-5 bg-burgundy text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg"
                                    >
                                        <Gavel size={18} />
                                        Afgør Tvist
                                    </button>
                                </>
                            )}

                            {showShippingRetry && (
                                <button
                                    onClick={handleRetryShipping}
                                    className="w-full py-5 bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-3"
                                >
                                    <RefreshCw size={18} className={isActionLoading ? "animate-spin" : ""} />
                                    Genopret Fragt
                                </button>
                            )}

                            {!showDisputeButtons && !showShippingRetry && (
                                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 bg-white/5 rounded-[2.5rem] border border-white/5 italic">
                                    <ShieldCheck size={48} className="text-white/20" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Sagen er lukket</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL */}
            {showResolveModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-6">
                    <div className="bg-white rounded-[3.5rem] p-12 max-w-xl w-full shadow-2xl relative">
                        <button onClick={() => setShowResolveModal(false)} className="absolute top-10 right-10 text-zinc-300 hover:text-racing-green transition-colors">
                            <X size={28} />
                        </button>

                        <div className="mb-8">
                            <h2 className="text-3xl font-serif font-black text-racing-green mb-2 italic">
                                {modalMode === 'resolve' ? 'Endelig Afgørelse' : 'Returforsendelse'}
                            </h2>
                            <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-black">
                                {modalMode === 'resolve' ? 'Vælg hvem der skal modtage pengene' : 'Dette sender instruktioner til køber'}
                            </p>
                        </div>

                        <textarea
                            className="w-full border-2 border-ivory-dark rounded-[2rem] p-6 text-base focus:border-burgundy outline-none h-48 mb-8 bg-ivory/30 italic font-serif placeholder:text-zinc-400"
                            placeholder={modalMode === 'resolve' ? "Skriv den interne begrundelse for afgørelsen (vigtigt)..." : "Besked til køberen om hvorfor og hvordan varen skal returneres..."}
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                        />

                        <div className="grid grid-cols-1 gap-4">
                            {modalMode === 'resolve' ? (
                                <>
                                    <button onClick={() => handleResolve('payout_seller')} className="w-full py-6 bg-racing-green text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:brightness-110 transition-all">Udbetal til Sælger</button>
                                    <button onClick={() => handleResolve('refund_buyer')} className="w-full py-6 bg-burgundy text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:brightness-110 transition-all">Refundér Køber</button>
                                </>
                            ) : (
                                <button onClick={handleRequestReturn} className="w-full py-6 bg-racing-green text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:brightness-110 transition-all">Send Retur Anmodning</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}