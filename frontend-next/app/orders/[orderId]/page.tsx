"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/app/components/UI/button";
import { api } from "@/app/api/api";
import { ArrowLeft, Package, AlertTriangle, CheckCircle2, ExternalLink, X, Truck } from "lucide-react";

export default function OrderDetailsPage() {
    const { orderId } = useParams();
    const router = useRouter();

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const [showDisputeModal, setShowDisputeModal] = useState(false);
    const [reason, setReason] = useState("");

    useEffect(() => {
        loadOrder();
    }, [orderId]);

    async function loadOrder() {
        try {
            const res = await api(`/api/orders/${orderId}`);
            const data = await res.json();
            if (data.success) {
                setOrder(data.data);
            }
        } catch (err) {
            console.error("Error fetching order:", err);
        } finally {
            setLoading(false);
        }
    }

    const handleApproveDelivery = async () => {
        if (!confirm("Bekræft at du har modtaget varen. Dette frigiver pengene til sælger med det samme.")) return;

        setIsActionLoading(true);
        try {
            const res = await api(`/api/orders/${orderId}/approve-delivery`, {
                method: "POST",
            });
            const data = await res.json();

            if (data.success) {
                alert("Levering godkendt!");
                loadOrder();
            } else {
                alert("Fejl: " + (data.message || "Kunne ikke godkende"));
            }
        } catch (err) {
            alert("Netværksfejl");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleOpenDispute = async () => {
        if (!reason.trim()) return alert("Angiv venligst en begrundelse.");

        setIsActionLoading(true);
        try {
            const res = await api(`/api/orders/${orderId}/dispute`, {
                method: "POST",
                body: JSON.stringify({ disputeReason: reason })
            });
            const data = await res.json();

            if (data.success) {
                alert("Sagen er oprettet.");
                setShowDisputeModal(false);
                loadOrder();
            }
        } finally {
            setIsActionLoading(false);
        }
    };

    if (loading) return <div className="p-20 text-center italic text-zinc-500 font-serif">Henter ordredetaljer...</div>;
    if (!order) return <div className="p-20 text-center text-red-500 font-bold">Ordren blev ikke fundet.</div>;

    const currentStatus = order.status?.toLowerCase();

    // Logik for hvornår knapper må vises
    const isFinished = currentStatus === 'completed' || currentStatus === 'cancelled';
    const isInDisputeFlow = currentStatus === 'disputed' || currentStatus === 'awaiting_return';

    // Man kan kun godkende eller lave en dispute, hvis ordren er aktiv og ikke allerede i en sag
    const showUserActions = !isFinished && !isInDisputeFlow && (currentStatus === 'paid' || currentStatus === 'shipped' || currentStatus === 'delivered');

    return (
        <div className="max-w-4xl mx-auto p-6 pt-24 text-white mb-20 font-sans">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-8 hover:text-white transition-colors group"
            >
                <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> Tilbage til mine køb
            </button>

            <div className="bg-[#16302b] rounded-[3rem] p-8 md:p-12 border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-burgundy/10 blur-[100px] rounded-full -mr-32 -mt-32" />

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-10">
                        <h1 className="text-3xl md:text-4xl font-serif font-black italic">Ordre Detaljer</h1>
                        <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            currentStatus === 'completed' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-white/5 border-white/10 text-zinc-400'
                        }`}>
                            {order.status.replace('_', ' ')}
                        </div>
                    </div>

                    {/* PRODUCT CARD */}
                    <div className="flex flex-col md:flex-row gap-8 mb-12 p-6 bg-black/20 rounded-[2rem] border border-white/5 items-center">
                        <div className="w-32 h-32 rounded-2xl overflow-hidden bg-zinc-900 shrink-0 shadow-xl">
                            <img
                                src={order.product?.images?.[0] || "/images/ImagePlaceholder.jpg"}
                                alt={order.product?.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-2xl font-bold mb-1">{order.product?.title}</h2>
                            <p className="text-burgundy-light text-2xl font-black">{order.totalAmount} DKK</p>
                            <p className="text-[9px] text-zinc-600 mt-2 font-mono uppercase tracking-tighter">Ordre ID: {order._id}</p>
                        </div>
                    </div>

                    {/* INFO GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                        <div className="space-y-4">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2 italic">
                                <Package size={12} /> Leveringsstatus
                            </p>
                            <p className="text-sm font-medium">
                                {order.shippingTrackingNumber ? (
                                    <a
                                        href={`https://tracking.shipmondo.com/${order.shippingTrackingNumber}`}
                                        target="_blank"
                                        className="text-burgundy-light underline hover:text-white transition-colors inline-flex items-center gap-2"
                                    >
                                        Track pakke via Shipmondo <ExternalLink size={14} />
                                    </a>
                                ) : (
                                    <span className="text-zinc-400 italic">Afventer label fra sælger</span>
                                )}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 italic">Hjælp</p>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Har du problemer med varen? Kontakt vores support eller opret en sag nedenfor.
                            </p>
                        </div>
                    </div>

                    {/* ACTIONS SEKTION */}
                    <div className="pt-10 border-t border-white/5 space-y-4">

                        {showUserActions && (
                            <>
                                <Button
                                    onClick={handleApproveDelivery}
                                    disabled={isActionLoading}
                                    className="bg-green-600 hover:bg-green-700 text-white py-8 rounded-2xl font-black uppercase tracking-[0.2em] w-full text-xs shadow-xl transition-all active:scale-[0.98]"
                                >
                                    {isActionLoading ? "Behandler..." : "Jeg har modtaget varen & alt er OK"}
                                </Button>

                                <button
                                    onClick={() => setShowDisputeModal(true)}
                                    className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-burgundy-light hover:text-white transition-colors"
                                >
                                    Opret sag / Dispute (Jeg har et problem)
                                </button>
                            </>
                        )}

                        {/* STATUS DISPLAYS */}
                        {currentStatus === "completed" && (
                            <div className="flex flex-col items-center justify-center p-10 bg-green-500/5 rounded-[2rem] border border-green-500/10 text-center">
                                <CheckCircle2 size={32} className="text-green-400 mb-3" />
                                <p className="text-green-400 font-black uppercase tracking-widest text-sm">Handlen er fuldført</p>
                                <p className="text-[10px] text-zinc-500 mt-1 italic font-serif">Tak fordi du handler på Gilbert</p>
                            </div>
                        )}

                        {currentStatus === "disputed" && (
                            <div className="p-8 bg-burgundy/5 rounded-[2rem] border border-burgundy/20 text-center">
                                <AlertTriangle size={32} className="mx-auto text-burgundy mb-4" />
                                <p className="text-burgundy font-black uppercase tracking-widest text-sm">Sag under behandling</p>
                                <p className="text-[11px] text-zinc-400 mt-2 max-w-xs mx-auto italic">
                                    Vi gennemgår din indsigelse og vender tilbage til dig hurtigst muligt.
                                </p>
                            </div>
                        )}

                        {currentStatus === "awaiting_return" && (
                            <div className="p-8 bg-zinc-900 rounded-[2rem] border border-white/5 text-center">
                                <Truck size={32} className="mx-auto text-zinc-500 mb-4 animate-bounce" />
                                <p className="text-white font-black uppercase tracking-widest text-sm">Venter på retur</p>
                                <p className="text-[11px] text-zinc-400 mt-2 max-w-xs mx-auto italic font-serif">
                                    Admin har anmodet om at få varen sendt ind til vurdering. Tjek din mail for instruktioner.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL - SAMME DESIGN SOM ADMIN */}
            {showDisputeModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4">
                    <div className="bg-[#16302b] border border-white/10 p-10 rounded-[3rem] max-w-lg w-full shadow-2xl relative">
                        <button onClick={() => setShowDisputeModal(false)} className="absolute top-8 right-8 text-zinc-500 hover:text-white">
                            <X size={24} />
                        </button>

                        <h2 className="text-3xl font-serif font-black mb-2 italic">Opret sag</h2>
                        <p className="text-[10px] text-zinc-500 mb-8 uppercase tracking-widest font-bold">Fortæl os hvad der er galt</p>

                        <textarea
                            className="w-full bg-black/40 border border-white/10 rounded-[1.5rem] p-5 text-sm text-white focus:outline-none focus:border-burgundy h-44 mb-8 transition-all resize-none italic font-serif"
                            placeholder="Beskriv problemet her..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setShowDisputeModal(false)} className="py-5 rounded-2xl font-black uppercase text-[10px] bg-zinc-900 hover:bg-black transition-all tracking-widest">
                                Fortryd
                            </button>
                            <button
                                onClick={handleOpenDispute}
                                disabled={isActionLoading}
                                className="py-5 rounded-2xl font-black uppercase text-[10px] bg-burgundy hover:brightness-125 transition-all tracking-widest shadow-lg shadow-burgundy/20"
                            >
                                {isActionLoading ? "Sender..." : "Indsend"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}