'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/app/api/api";
import {
    ArrowLeft,
    User,
    MapPin,
    CreditCard,
    Truck,
    AlertCircle,
    CheckCircle2,
    RefreshCw,
    Mail,
    Gavel,
    PackageSearch,
    X
} from "lucide-react";

export default function OrderDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Modal States
    const [showResolveModal, setShowResolveModal] = useState(false);
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

    // ACTION: Retry Shipping
    async function handleRetryShipping() {
        if (!confirm("Vil du forsøge at generere en ny fragtlabel via Shipmondo?")) return;
        setIsActionLoading(true);
        try {
            const res = await api(`/api/admin/orders/${id}/retry-shipping`, { method: "POST" });
            if (res.ok) {
                alert("Succes! Fragtlabel er oprettet.");
                loadOrder();
            }
        } finally {
            setIsActionLoading(false);
        }
    }

    // ACTION: Request Return (Admin beder om at få varen ind)
    async function handleRequestReturn() {
        if (!confirm("Vil du bede køberen om at sende varen ind til vurdering (Gilbert-tjek)? Dette ændrer ordrestatus.")) return;
        setIsActionLoading(true);
        try {
            const res = await api(`/api/admin/orders/${id}/request-return`, { method: "POST" });
            if (res.ok) {
                alert("Anmodning om returnering er sendt.");
                loadOrder();
            }
        } finally {
            setIsActionLoading(false);
        }
    }

    // ACTION: Resolve Dispute (Endelig afgørelse)
    async function handleResolve(decision: 'refund' | 'payout') {
        if (!adminNote.trim()) return alert("Du skal angive en intern begrundelse for afgørelsen.");

        setIsActionLoading(true);
        try {
            const res = await api(`/api/admin/orders/${id}/resolve-dispute`, {
                method: "POST",
                body: JSON.stringify({
                    decision,
                    adminNote
                })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Tvist afgjort: ${decision === 'refund' ? 'Køber refunderet' : 'Sælger betalt'}`);
                setShowResolveModal(false);
                setAdminNote("");
                loadOrder();
            }
        } catch (err) {
            alert("Kunne ikke gemme afgørelsen.");
        } finally {
            setIsActionLoading(false);
        }
    }

    if (loading) return <div className="p-20 text-center italic text-racing-green font-serif">Indlæser detaljer...</div>;
    if (!order) return <div className="p-20 text-center text-red-600 font-bold">Ordren blev ikke fundet.</div>;

    return (
        <div className="max-w-5xl mx-auto p-6 mt-10 mb-20">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-brown hover:text-racing-green transition mb-6 font-medium"
            >
                <ArrowLeft size={18} /> Tilbage til overblik
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-ivory p-8 rounded-3xl border border-ivory-dark shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Order ID: {order._id}</span>
                                <h1 className="text-2xl font-serif font-bold text-racing-green mt-1">{order.product?.title || "Slettet produkt"}</h1>
                            </div>
                            <div className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase ${
                                order.status === 'disputed' ? 'bg-orange-100 text-orange-700 animate-pulse' :
                                    order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-600'
                            }`}>
                                {order.status}
                            </div>
                        </div>

                        {/* DISPUTE REASON DISPLAY */}
                        {order.disputeReason && (
                            <div className="mb-6 p-5 bg-orange-50 border border-orange-100 rounded-2xl">
                                <h4 className="text-xs font-bold text-orange-800 uppercase flex items-center gap-2 mb-2">
                                    <AlertCircle size={14} /> Købers begrundelse for tvist:
                                </h4>
                                <p className="text-sm text-orange-900 italic">"{order.disputeReason}"</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-brown/10">
                            <div>
                                <h4 className="text-[10px] font-bold uppercase text-brown/50 mb-3 flex items-center gap-2 italic">
                                    <CreditCard size={12} /> Økonomi
                                </h4>
                                <p className="text-2xl font-black text-burgundy">{order.totalAmount} DKK</p>
                                <p className="text-[10px] text-zinc-400 mt-1 font-mono">Platform Fee: {order.platformFee} DKK</p>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold uppercase text-brown/50 mb-3 flex items-center gap-2 italic">
                                    <Truck size={12} /> Fragt status
                                </h4>
                                {order.shippingTrackingNumber ? (
                                    <p className="text-sm font-bold text-green-700 break-all">{order.shippingTrackingNumber}</p>
                                ) : (
                                    <p className="text-sm italic text-zinc-400 italic">Ingen label genereret</p>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-3xl border border-ivory-dark">
                            <h4 className="text-[10px] font-bold uppercase text-brown/50 mb-4 flex items-center gap-2 italic">
                                <MapPin size={12} /> Køber
                            </h4>
                            <p className="text-sm font-bold text-racing-green">{order.buyer?.username}</p>
                            <p className="text-xs text-zinc-500">{order.buyer?.email}</p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-ivory-dark">
                            <h4 className="text-[10px] font-bold uppercase text-brown/50 mb-4 flex items-center gap-2 italic">
                                <User size={12} /> Sælger
                            </h4>
                            <p className="text-sm font-bold text-racing-green">{order.seller?.username}</p>
                            <p className="text-xs text-zinc-500">{order.seller?.email}</p>
                        </div>
                    </section>
                </div>

                {/* ADMIN ACTIONS SIDEBAR */}
                <div className="space-y-6">
                    <div className="bg-racing-green text-ivory p-6 rounded-3xl shadow-xl">
                        <h3 className="font-bold mb-6 uppercase text-[11px] tracking-[0.2em] border-b border-ivory/10 pb-3 italic text-center">Admin Controls</h3>

                        <div className="space-y-3">
                            {/* REQUEST RETURN */}
                            <button
                                onClick={handleRequestReturn}
                                disabled={isActionLoading || order.status === 'awaiting_return'}
                                className="w-full py-4 bg-zinc-800 text-ivory rounded-2xl font-bold text-xs hover:bg-black transition-all flex items-center justify-center gap-3"
                            >
                                <PackageSearch size={16} />
                                {order.status === 'awaiting_return' ? "Afventer Retur" : "Request Return"}
                            </button>

                            {/* RESOLVE DISPUTE BUTTON */}
                            <button
                                onClick={() => setShowResolveModal(true)}
                                className="w-full py-4 bg-burgundy text-white rounded-2xl font-bold text-xs hover:brightness-110 transition-all flex items-center justify-center gap-3 shadow-md"
                            >
                                <Gavel size={16} />
                                Resolve Dispute
                            </button>

                            <button
                                onClick={handleRetryShipping}
                                disabled={isActionLoading}
                                className="w-full py-4 bg-white/10 text-ivory rounded-2xl font-bold text-xs hover:bg-white/20 transition-all flex items-center justify-center gap-3"
                            >
                                <RefreshCw size={16} className={isActionLoading ? "animate-spin" : ""} />
                                Retry Label
                            </button>
                        </div>
                    </div>

                    <div className="bg-ivory-dark/30 p-6 rounded-3xl border border-brown/5">
                        <h3 className="text-[10px] font-bold uppercase mb-4 opacity-40 tracking-widest italic text-center">System Log</h3>
                        <ul className="text-[10px] space-y-3 font-mono text-brown/70">
                            <li className="flex justify-between border-b border-brown/5 pb-2">
                                <span>Paid:</span>
                                <span className="font-bold text-green-600">YES</span>
                            </li>
                            <li className="flex justify-between border-b border-brown/5 pb-2">
                                <span>Sælger Payout:</span>
                                <span>{order.sellerPayout} DKK</span>
                            </li>
                            {order.deliveredAt && (
                                <li className="flex justify-between border-b border-brown/5 pb-2">
                                    <span>Leveret:</span>
                                    <span>{new Date(order.deliveredAt).toLocaleDateString()}</span>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            {/* RESOLVE DISPUTE MODAL */}
            {showResolveModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl relative border-4 border-burgundy">
                        <button onClick={() => setShowResolveModal(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-black">
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-serif font-black text-racing-green mb-2 italic">Afgør Tvist</h2>
                        <p className="text-xs text-zinc-500 mb-6 uppercase tracking-widest font-bold">Vælg den endelige handling for denne ordre</p>

                        <div className="space-y-4 mb-8">
                            <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1 ml-2">Intern Begrundelse (Vigtigt)</label>
                            <textarea
                                className="w-full border-2 border-ivory-dark rounded-2xl p-4 text-sm focus:border-burgundy outline-none h-32 transition-all"
                                placeholder="Hvorfor træffer du denne afgørelse?..."
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <button
                                onClick={() => handleResolve('payout')}
                                disabled={isActionLoading}
                                className="w-full py-4 bg-racing-green text-white rounded-2xl font-bold text-xs hover:brightness-110 shadow-lg shadow-racing-green/20 uppercase tracking-widest transition-all active:scale-95"
                            >
                                {isActionLoading ? "Behandler..." : "Frigiv udbetaling til Sælger"}
                            </button>
                            <button
                                onClick={() => handleResolve('refund')}
                                disabled={isActionLoading}
                                className="w-full py-4 bg-burgundy text-white rounded-2xl font-bold text-xs hover:brightness-110 shadow-lg shadow-burgundy/20 uppercase tracking-widest transition-all active:scale-95"
                            >
                                {isActionLoading ? "Behandler..." : "Refundér Køber (Full Refund)"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}