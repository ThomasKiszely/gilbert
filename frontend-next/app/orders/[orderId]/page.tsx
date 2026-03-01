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

export default function AdminOrderDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Modal States for Dispute Resolution
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

    // ACTION: Retry Shipping Label (Shipmondo)
    async function handleRetryShipping() {
        if (!confirm("Vil du forsøge at generere en ny fragtlabel via Shipmondo?")) return;
        setIsActionLoading(true);
        try {
            const res = await api(`/api/admin/orders/${id}/retry-shipping`, { method: "POST" });
            const data = await res.json();
            if (res.ok) {
                alert("Succes! Fragtlabel er oprettet og sendt til sælger.");
                loadOrder();
            } else {
                alert("Fejl: " + (data.message || "Kunne ikke oprette label"));
            }
        } finally {
            setIsActionLoading(false);
        }
    }

    // ACTION: Request Return (Sender mail til køber om indsendelse til Gilbert-tjek)
    async function handleRequestReturn() {
        if (!confirm("Vil du bede køberen om at sende varen ind til vurdering? Der sendes en mail til køber med det samme.")) return;
        setIsActionLoading(true);
        try {
            const res = await api(`/api/admin/orders/${id}/request-return`, { method: "POST" });
            if (res.ok) {
                alert("Mail er sendt til køberen med instruktioner om returnering.");
                loadOrder();
            }
        } finally {
            setIsActionLoading(false);
        }
    }

    // ACTION: Resolve Dispute (Afgørelse med de korrekte backend-strenge)
    async function handleResolve(decision: 'refund_buyer' | 'payout_seller') {
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
                alert(`Tvist afgjort: ${decision === 'refund_buyer' ? 'Køber refunderet' : 'Sælger betalt'}`);
                setShowResolveModal(false);
                setAdminNote("");
                loadOrder();
            } else {
                alert("Fejl: " + data.message);
            }
        } catch (err) {
            alert("Kunne ikke gemme afgørelsen pga. netværksfejl.");
        } finally {
            setIsActionLoading(false);
        }
    }

    if (loading) return <div className="p-20 text-center italic text-racing-green font-serif">Indlæser ordredetaljer...</div>;
    if (!order) return <div className="p-20 text-center text-red-600 font-bold">Ordren blev ikke fundet.</div>;

    return (
        <div className="max-w-5xl mx-auto p-6 mt-10 mb-20 font-sans">
            {/* BACK BUTTON */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-brown hover:text-racing-green transition mb-6 font-medium group"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Tilbage til overblik
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* VENSTRE KOLONNE: INFO & ADRESSER */}
                <div className="lg:col-span-2 space-y-6">

                    {/* HOVEDKORT */}
                    <section className="bg-ivory p-8 rounded-3xl border border-ivory-dark shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest italic">Order ID: {order._id}</span>
                                <h1 className="text-2xl font-serif font-black text-racing-green mt-1 italic">{order.product?.title || "Slettet produkt"}</h1>
                            </div>
                            <div className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                order.status === 'disputed' ? 'bg-burgundy text-white animate-pulse' :
                                    order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-600'
                            }`}>
                                {order.status}
                            </div>
                        </div>

                        {/* DISPUTE REASON DISPLAY - Vises hvis køber har åbnet en sag */}
                        {order.disputeReason && (
                            <div className="mb-6 p-5 bg-burgundy/5 border border-burgundy/10 rounded-2xl">
                                <h4 className="text-[10px] font-black text-burgundy uppercase flex items-center gap-2 mb-2 tracking-widest">
                                    <AlertCircle size={14} /> Købers Indsigelse:
                                </h4>
                                <p className="text-sm text-zinc-700 italic leading-relaxed">"{order.disputeReason}"</p>
                            </div>
                        )}

                        {/* SHIPPING ERROR DISPLAY */}
                        {order.shippingError && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 text-red-700 items-start">
                                <AlertCircle className="shrink-0 mt-0.5" size={18} />
                                <div>
                                    <p className="font-bold text-sm uppercase text-[10px]">Shipping System Error</p>
                                    <p className="text-xs opacity-90 italic">"{order.shippingError}"</p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-brown/10">
                            <div>
                                <h4 className="text-[10px] font-bold uppercase text-brown/50 mb-3 flex items-center gap-2 italic">
                                    <CreditCard size={12} /> Betalingsdetaljer
                                </h4>
                                <p className="text-2xl font-black text-burgundy">{order.totalAmount} DKK</p>
                                <p className="text-[10px] text-zinc-400 mt-1 font-mono">Platform Fee: {order.platformFee} DKK</p>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold uppercase text-brown/50 mb-3 flex items-center gap-2 italic">
                                    <Truck size={12} /> Forsendelse
                                </h4>
                                {order.shippingTrackingNumber ? (
                                    <div className="flex items-center gap-2 text-green-700">
                                        <CheckCircle2 size={14} />
                                        <p className="text-sm font-bold truncate">{order.shippingTrackingNumber}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm italic text-zinc-400">Label ikke genereret</p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* ADRESSE SEKTION */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-3xl border border-ivory-dark shadow-sm">
                            <h4 className="text-[10px] font-bold uppercase text-brown/50 mb-4 flex items-center gap-2 italic tracking-widest">
                                <MapPin size={12} /> Købers Adresse
                            </h4>
                            <p className="text-sm font-bold text-racing-green">{order.buyer?.username}</p>
                            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                                {order.shippingAddress?.street}<br />
                                {order.shippingAddress?.zip} {order.shippingAddress?.city}<br />
                                {order.shippingAddress?.country}
                            </p>
                            <p className="text-[10px] text-zinc-400 mt-3 font-mono">{order.buyer?.email}</p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-ivory-dark shadow-sm">
                            <h4 className="text-[10px] font-bold uppercase text-brown/50 mb-4 flex items-center gap-2 italic tracking-widest">
                                <User size={12} /> Sælger Info
                            </h4>
                            <p className="text-sm font-bold text-racing-green">{order.seller?.username}</p>
                            <p className="text-xs text-zinc-500 mt-1">{order.seller?.email}</p>
                            <div className="mt-4 p-3 bg-zinc-50 rounded-xl">
                                <p className="text-[9px] uppercase text-zinc-400 font-bold mb-1">Stripe Connect ID</p>
                                <p className="text-[10px] font-mono truncate">{order.seller?.stripeAccountId || 'Ikke tilknyttet'}</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* HØJRE KOLONNE: ADMIN ACTIONS */}
                <div className="space-y-6">
                    <div className="bg-racing-green text-ivory p-6 rounded-3xl shadow-xl sticky top-24">
                        <h3 className="font-bold mb-6 uppercase text-[11px] tracking-[0.2em] border-b border-ivory/10 pb-3 italic text-center">Admin Operations</h3>

                        <div className="space-y-3">
                            {/* REQUEST RETURN */}
                            <button
                                onClick={handleRequestReturn}
                                disabled={isActionLoading || order.status === 'awaiting_return'}
                                className={`w-full py-4 bg-zinc-900 text-ivory rounded-2xl font-bold text-xs hover:bg-black transition-all flex items-center justify-center gap-3 shadow-lg ${isActionLoading ? 'opacity-50' : ''}`}
                            >
                                <PackageSearch size={16} />
                                {order.status === 'awaiting_return' ? "Afventer Retur..." : "Request Return (Mail)"}
                            </button>

                            {/* RESOLVE DISPUTE */}
                            <button
                                onClick={() => setShowResolveModal(true)}
                                className="w-full py-4 bg-burgundy text-white rounded-2xl font-bold text-xs hover:brightness-110 transition-all flex items-center justify-center gap-3 shadow-lg"
                            >
                                <Gavel size={16} />
                                Resolve Dispute
                            </button>

                            {/* RETRY SHIPPING */}
                            <button
                                onClick={handleRetryShipping}
                                disabled={isActionLoading}
                                className="w-full py-4 bg-white/10 text-ivory rounded-2xl font-bold text-xs hover:bg-white/20 transition-all flex items-center justify-center gap-3 border border-white/5"
                            >
                                <RefreshCw size={16} className={isActionLoading ? "animate-spin" : ""} />
                                Retry Shipping
                            </button>

                            {/* CONTACT VIA EMAIL */}
                            <a
                                href={`mailto:${order.buyer?.email}?subject=Vedrørende din ordre #${order._id.slice(-6).toUpperCase()}`}
                                className="w-full py-4 bg-white/5 text-ivory/60 rounded-2xl font-bold text-[10px] hover:bg-white/10 transition-all flex items-center justify-center gap-3 uppercase tracking-widest mt-4"
                            >
                                <Mail size={14} />
                                Kontakt Køber
                            </a>
                        </div>
                    </div>

                    {/* SYSTEM LOGS */}
                    <div className="bg-ivory-dark/30 p-6 rounded-3xl border border-brown/5 shadow-inner">
                        <h3 className="text-[10px] font-bold uppercase mb-4 opacity-40 tracking-widest italic text-center">System Log Historik</h3>
                        <ul className="text-[10px] space-y-4 font-mono text-brown/70 leading-relaxed">
                            <li className="flex justify-between border-b border-brown/5 pb-2">
                                <span>Oprettet:</span>
                                <span className="font-bold">{new Date(order.createdAt).toLocaleDateString('da-DK')}</span>
                            </li>
                            <li className="flex justify-between border-b border-brown/5 pb-2">
                                <span>Sælger Payout:</span>
                                <span className="font-bold">{order.sellerPayout} DKK</span>
                            </li>
                            {order.deliveredAt && (
                                <li className="flex justify-between border-b border-brown/5 pb-2">
                                    <span>Bekræftet modtaget:</span>
                                    <span>{new Date(order.deliveredAt).toLocaleDateString()}</span>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            {/* RESOLVE DISPUTE MODAL */}
            {showResolveModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl relative border-[6px] border-burgundy/10">
                        <button
                            onClick={() => setShowResolveModal(false)}
                            className="absolute top-8 right-8 text-zinc-400 hover:text-black transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-3xl font-serif font-black text-racing-green mb-2 italic">Afgør Tvist</h2>
                        <p className="text-[10px] text-zinc-400 mb-8 uppercase tracking-[0.2em] font-bold">Vælg den endelige økonomiske handling</p>

                        <div className="space-y-4 mb-8">
                            <label className="block text-[10px] font-black uppercase text-zinc-500 mb-1 ml-2 tracking-widest">Intern Begrundelse (Logges)</label>
                            <textarea
                                className="w-full border-2 border-ivory-dark rounded-2xl p-4 text-sm focus:border-burgundy outline-none h-32 transition-all bg-ivory/20 resize-none"
                                placeholder="Hvorfor træffer du denne afgørelse? Denne tekst gemmes i systemet..."
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-3 font-sans">
                            <button
                                onClick={() => handleResolve('payout_seller')}
                                disabled={isActionLoading}
                                className="w-full py-5 bg-racing-green text-white rounded-2xl font-black text-xs hover:brightness-110 shadow-lg shadow-racing-green/20 uppercase tracking-[0.15em] transition-all active:scale-[0.98]"
                            >
                                {isActionLoading ? "Udfører..." : "Godkend & Udbetal til Sælger"}
                            </button>
                            <button
                                onClick={() => handleResolve('refund_buyer')}
                                disabled={isActionLoading}
                                className="w-full py-5 bg-burgundy text-white rounded-2xl font-black text-xs hover:brightness-110 shadow-lg shadow-burgundy/20 uppercase tracking-[0.15em] transition-all active:scale-[0.98]"
                            >
                                {isActionLoading ? "Udfører..." : "Afvis & Refundér Køber"}
                            </button>
                            <button
                                onClick={() => setShowResolveModal(false)}
                                className="w-full py-3 text-zinc-400 font-bold text-[10px] uppercase tracking-widest hover:text-zinc-600 transition-colors"
                            >
                                Annuller handling
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}