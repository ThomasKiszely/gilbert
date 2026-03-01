"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/app/components/UI/button";
import { api } from "@/app/api/api"; // Bruger din eksisterende helper
import { ArrowLeft, Package, AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react";

export default function OrderDetailsPage() {
    const { orderId } = useParams();
    const router = useRouter();

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Fetch order
    useEffect(() => {
        loadOrder();
    }, [orderId]);

    async function loadOrder() {
        try {
            // Vi bruger din api helper, som automatisk tager token fra localStorage
            const res = await api(`/api/orders/${orderId}`);
            const data = await res.json();
            if (data.success) {
                setOrder(data.data);
            } else {
                console.error("Kunne ikke hente ordre:", data.message);
            }
        } catch (err) {
            console.error("Error fetching order:", err);
        } finally {
            setLoading(false);
        }
    }

    // --- Approve delivery (køber godkender modtagelse) ---
    const handleApproveDelivery = async () => {
        if (!confirm("Bekræft at du har modtaget varen. Dette frigiver pengene til sælger.")) return;

        setIsActionLoading(true);
        try {
            const res = await api(`/api/orders/${orderId}/approve-delivery`, {
                method: "POST",
            });
            const data = await res.json();

            if (data.success) {
                alert("Levering godkendt!");
                loadOrder(); // Reload data i stedet for router.refresh for hurtigere feedback
            } else {
                alert("Fejl: " + (data.message || "Kunne ikke godkende"));
            }
        } catch (err) {
            alert("Netværksfejl");
        } finally {
            setIsActionLoading(false);
        }
    };

    // --- Open dispute ---
    const handleOpenDispute = async () => {
        const reason = prompt("Beskriv kort årsagen til din indsigelse (dispute):");
        if (reason === null) return;

        setIsActionLoading(true);
        try {
            const res = await api(`/api/orders/${orderId}/dispute`, {
                method: "POST",
                body: JSON.stringify({ reason })
            });
            const data = await res.json();

            if (data.success) {
                alert("Sagen er oprettet. Vi kigger på den hurtigst muligt.");
                loadOrder();
            }
        } catch (err) {
            alert("Kunne ikke oprette sag.");
        } finally {
            setIsActionLoading(false);
        }
    };

    if (loading) return <div className="p-20 text-center italic text-zinc-500 font-serif">Henter ordredetaljer...</div>;
    if (!order) return <div className="p-20 text-center text-red-500 font-bold">Ordren blev ikke fundet.</div>;

    // --- Countdown logic ---
    const payoutDate = order.payoutEligibleAt ? new Date(order.payoutEligibleAt) : null;
    const hoursLeft = payoutDate
        ? Math.max(0, Math.floor((payoutDate.getTime() - Date.now()) / (1000 * 60 * 60)))
        : 0;

    const showCountdown = order.status === "shipped" && payoutDate && hoursLeft > 0;

    return (
        <div className="max-w-4xl mx-auto p-6 pt-24 text-white mb-20">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-500 mb-8 hover:text-white transition-colors"
            >
                <ArrowLeft size={14} /> Tilbage
            </button>

            <div className="bg-[#16302b] rounded-[3rem] p-8 md:p-12 border border-white/5 shadow-2xl relative overflow-hidden">
                {/* Dekorativ baggrunds-effekt */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-burgundy/10 blur-[100px] rounded-full -mr-32 -mt-32" />

                <div className="relative z-10">
                    <h1 className="text-3xl md:text-4xl font-serif font-black mb-8">Ordredetaljer</h1>

                    {/* PRODUCT CARD */}
                    <div className="flex flex-col md:flex-row gap-8 mb-12 p-6 bg-black/20 rounded-3xl border border-white/5">
                        <div className="w-full md:w-40 h-40 rounded-2xl overflow-hidden bg-zinc-900 shrink-0 shadow-inner">
                            <img
                                src={order.product?.images?.[0] || "/images/ImagePlaceholder.jpg"}
                                alt={order.product?.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="flex flex-col justify-center">
                            <span className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-mono">Produkt</span>
                            <h2 className="text-2xl font-bold">{order.product?.title}</h2>
                            <p className="text-burgundy-light text-3xl font-black mt-2">{order.totalAmount} DKK</p>
                            <p className="text-[10px] text-zinc-500 mt-4 font-mono">ID: {order._id}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* STATUS SEKTION */}
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-3 flex items-center gap-2">
                                <Package size={14} /> Status
                            </p>
                            <div className="inline-flex items-center gap-2 bg-white/10 px-6 py-2 rounded-full font-bold uppercase tracking-widest text-sm border border-white/10">
                                <div className={`w-2 h-2 rounded-full animate-pulse ${order.status === 'completed' ? 'bg-green-400' : 'bg-burgundy'}`} />
                                {order.status}
                            </div>

                            {showCountdown && (
                                <div className="mt-4 p-4 bg-burgundy/10 border border-burgundy/20 rounded-2xl">
                                    <p className="text-xs text-zinc-300 leading-relaxed">
                                        Du har <span className="font-bold text-white">{hoursLeft} timer</span> til at gøre indsigelse, før betalingen automatisk frigives til sælger.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* SHIPPING SEKTION */}
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-3">Forsendelse</p>
                            {order.shippingTrackingNumber ? (
                                <div className="space-y-3">
                                    <p className="text-sm flex items-center gap-2">
                                        Tracking:
                                        <a
                                            href={`https://tracking.shipmondo.com/${order.shippingTrackingNumber}`}
                                            target="_blank"
                                            className="font-bold underline text-burgundy-light flex items-center gap-1 hover:text-white transition-colors"
                                        >
                                            {order.shippingTrackingNumber} <ExternalLink size={12} />
                                        </a>
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm italic text-zinc-400">Venter på at sælger indleverer pakken...</p>
                            )}
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="mt-12 pt-10 border-t border-white/5 space-y-4">
                        {/* Approve Delivery - Kun hvis pakken er sendt og ikke afsluttet */}
                        {(order.status === "shipped" || order.status === "paid") && (
                            <Button
                                onClick={handleApproveDelivery}
                                disabled={isActionLoading}
                                className="bg-green-600 hover:bg-green-700 text-white py-8 rounded-2xl font-bold uppercase tracking-[0.2em] w-full text-xs shadow-lg transition-transform active:scale-[0.98]"
                            >
                                {isActionLoading ? "Behandler..." : "Marker som Modtaget & Godkend"}
                            </Button>
                        )}

                        {/* Open Dispute - Kun hvis status er leveret eller sendt */}
                        {(order.status === "shipped" || order.status === "delivered") && hoursLeft > 0 && (
                            <Button
                                onClick={handleOpenDispute}
                                disabled={isActionLoading}
                                className="bg-transparent border border-burgundy text-burgundy hover:bg-burgundy hover:text-white py-6 rounded-2xl font-bold uppercase tracking-[0.2em] w-full text-[10px] transition-all"
                            >
                                <AlertTriangle size={14} className="mr-2" /> Opret sag / Dispute
                            </Button>
                        )}

                        {/* Completed / Disputed badges */}
                        {order.status === "completed" && (
                            <div className="flex items-center justify-center gap-2 text-green-400 font-bold py-4 bg-green-400/5 rounded-2xl border border-green-400/20">
                                <CheckCircle2 size={18} /> Handlen er gennemført
                            </div>
                        )}

                        {order.status === "disputed" && (
                            <div className="flex items-center justify-center gap-2 text-burgundy font-bold py-4 bg-burgundy/5 rounded-2xl border border-burgundy/20">
                                <AlertTriangle size={18} /> Der er oprettet en sag på denne ordre
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}