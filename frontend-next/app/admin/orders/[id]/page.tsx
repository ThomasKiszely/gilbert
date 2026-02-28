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
    Gavel
} from "lucide-react";

export default function OrderDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);

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

    // ACTION: Retry Shipping Label
    async function handleRetryShipping() {
        if (!confirm("Vil du forsøge at generere en ny fragtlabel via Shipmondo?")) return;

        setIsActionLoading(true);
        try {
            const res = await api(`/api/admin/orders/${id}/retry-shipping`, {
                method: "POST"
            });
            const data = await res.json();

            if (res.ok) {
                alert("Succes! Fragtlabel er oprettet og sendt til sælger.");
                loadOrder(); // Refresh data
            } else {
                alert("Fejl: " + (data.message || "Kunne ikke oprette label"));
            }
        } catch (err) {
            alert("Netværksfejl under forsøg på fragt-retry.");
        } finally {
            setIsActionLoading(false);
        }
    }

    // ACTION: Resolve Dispute (Placeholder indtil backend er klar)
    async function handleResolveDispute() {
        alert("Funktionen 'Resolve Dispute' kræver valg af refundering eller udbetaling. Vi bygger denne modal næste gang.");
    }

    if (loading) return <div className="p-20 text-center italic text-racing-green font-serif">Indlæser detaljer...</div>;
    if (!order) return <div className="p-20 text-center text-red-600 font-bold">Ordren blev ikke fundet.</div>;

    return (
        <div className="max-w-5xl mx-auto p-6 mt-10 mb-20">
            {/* BACK BUTTON */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-brown hover:text-racing-green transition mb-6 font-medium"
            >
                <ArrowLeft size={18} /> Tilbage til overblik
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* VENSTRE KOLONNE: PRODUKT & ADRESSER */}
                <div className="lg:col-span-2 space-y-6">

                    {/* HOVEDKORT */}
                    <section className="bg-ivory p-8 rounded-3xl border border-ivory-dark shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Order ID: {order._id}</span>
                                <h1 className="text-2xl font-serif font-bold text-racing-green mt-1">{order.product?.title || "Slettet produkt"}</h1>
                            </div>
                            <div className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase ${
                                order.status === 'paid' ? 'bg-green-100 text-green-700' :
                                    order.status === 'disputed' ? 'bg-orange-100 text-orange-700' : 'bg-zinc-100 text-zinc-600'
                            }`}>
                                {order.status}
                            </div>
                        </div>

                        {/* SHIPPING ERROR DISPLAY */}
                        {order.shippingError && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 text-red-700 items-start">
                                <AlertCircle className="shrink-0 mt-0.5" size={18} />
                                <div>
                                    <p className="font-bold text-sm">Shipping System Error</p>
                                    <p className="text-xs opacity-90 italic">"{order.shippingError}"</p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-brown/10">
                            <div>
                                <h4 className="text-[10px] font-bold uppercase text-brown/50 mb-3 flex items-center gap-2">
                                    <CreditCard size={12} /> Betalingsdetaljer
                                </h4>
                                <p className="text-2xl font-black text-burgundy">{order.totalAmount} DKK</p>
                                <p className="text-[10px] text-zinc-400 mt-1 font-mono">Stripe PI: {order.stripePaymentIntentId || 'Ikke fundet'}</p>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold uppercase text-brown/50 mb-3 flex items-center gap-2">
                                    <Truck size={12} /> Forsendelse
                                </h4>
                                {order.shippingTrackingNumber ? (
                                    <div className="flex items-center gap-2 text-green-700">
                                        <CheckCircle2 size={14} />
                                        <p className="text-sm font-bold">{order.shippingTrackingNumber}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm italic text-zinc-400">Label ikke genereret endnu</p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* ADRESSE SEKTION */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-3xl border border-ivory-dark">
                            <h4 className="text-[10px] font-bold uppercase text-brown/50 mb-4 flex items-center gap-2 italic">
                                <MapPin size={12} /> Købers leveringsadresse
                            </h4>
                            <p className="text-sm font-bold text-racing-green">{order.buyer?.username}</p>
                            <p className="text-sm text-zinc-600 mt-1">
                                {order.shippingAddress?.street} {order.shippingAddress?.houseNumber}<br />
                                {order.shippingAddress?.zip} {order.shippingAddress?.city}<br />
                                {order.shippingAddress?.country}
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-ivory-dark">
                            <h4 className="text-[10px] font-bold uppercase text-brown/50 mb-4 flex items-center gap-2 italic">
                                <User size={12} /> Sælger information
                            </h4>
                            <p className="text-sm font-bold text-racing-green">{order.seller?.username}</p>
                            <p className="text-xs text-zinc-500">{order.seller?.email}</p>
                            <p className="text-[10px] text-zinc-400 mt-4 font-mono">
                                Stripe Acc: {order.seller?.stripeAccountId || 'Mangler'}
                            </p>
                        </div>
                    </section>
                </div>

                {/* HØJRE KOLONNE: ADMIN ACTIONS */}
                <div className="space-y-6">
                    <div className="bg-racing-green text-ivory p-6 rounded-3xl shadow-xl">
                        <h3 className="font-bold mb-6 uppercase text-[11px] tracking-[0.2em] border-b border-ivory/10 pb-3">Admin Panel</h3>

                        <div className="space-y-3">
                            {/* RETRY SHIPPING */}
                            <button
                                onClick={handleRetryShipping}
                                disabled={isActionLoading}
                                className={`w-full py-4 bg-ivory text-racing-green rounded-2xl font-bold text-xs hover:bg-white transition-all flex items-center justify-center gap-3 shadow-sm ${isActionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <RefreshCw size={16} className={isActionLoading ? "animate-spin" : ""} />
                                {isActionLoading ? "Forbinder..." : "Retry Shipping Label"}
                            </button>

                            {/* RESOLVE DISPUTE */}
                            <button
                                onClick={handleResolveDispute}
                                className="w-full py-4 bg-burgundy text-white rounded-2xl font-bold text-xs hover:brightness-110 transition-all flex items-center justify-center gap-3 shadow-md"
                            >
                                <Gavel size={16} />
                                Resolve Dispute
                            </button>

                            {/* CONTACT VIA EMAIL */}
                            <a
                                href={`mailto:${order.buyer?.email}?subject=Vedrørende din ordre #${order._id.slice(-6).toUpperCase()}`}
                                className="w-full py-4 bg-white/10 text-ivory rounded-2xl font-bold text-xs hover:bg-white/20 transition-all flex items-center justify-center gap-3"
                            >
                                <Mail size={16} />
                                Kontakt Køber
                            </a>
                        </div>
                    </div>

                    {/* LOG HISTORIK */}
                    <div className="bg-ivory-dark/30 p-6 rounded-3xl border border-brown/5">
                        <h3 className="text-[10px] font-bold uppercase mb-4 opacity-40 tracking-widest">Log Historik</h3>
                        <ul className="text-[10px] space-y-4 font-mono text-brown/70">
                            <li className="flex justify-between border-b border-brown/5 pb-2">
                                <span>Oprettet:</span>
                                <span className="font-bold">{new Date(order.createdAt).toLocaleDateString('da-DK')}</span>
                            </li>
                            <li className="flex justify-between border-b border-brown/5 pb-2">
                                <span>Betaling:</span>
                                <span className="text-green-600 font-bold uppercase">Captured</span>
                            </li>
                            {order.shippingError && (
                                <li className="text-red-600 flex flex-col gap-1">
                                    <span className="font-bold underline">Sidste Fejl:</span>
                                    <span className="leading-relaxed italic">{order.shippingError}</span>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}