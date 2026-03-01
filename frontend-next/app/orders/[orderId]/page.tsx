"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/app/components/UI/button";
import { api } from "@/app/api/api";
import { ArrowLeft, Package, AlertTriangle, CheckCircle2, ExternalLink, X, Truck } from "lucide-react";
import OrderRating from "@/app/components/orders/OrderRating";

export default function OrderDetailsPage() {
    const { orderId } = useParams();
    const router = useRouter();

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Dispute states
    const [showDisputeModal, setShowDisputeModal] = useState(false);
    const [reason, setReason] = useState("");

    // Tracks if the user has rated in the current session
    const [hasRated, setHasRated] = useState(false);

    useEffect(() => {
        if (orderId) {
            loadOrder();
        }
    }, [orderId]);

    async function loadOrder() {
        try {
            const res = await api(`/api/orders/${orderId}`);
            const data = await res.json();
            if (data.success) {
                setOrder(data.data);

                // If your backend API checks ReviewRepo, it can return hasReviewed: true
                if (data.data.hasReviewed) {
                    setHasRated(true);
                }
            }
        } catch (err) {
            console.error("Error fetching order:", err);
        } finally {
            setLoading(false);
        }
    }

    const handleApproveDelivery = async () => {
        if (!confirm("Confirm that you have received the item. This will release the funds to the seller immediately.")) return;

        setIsActionLoading(true);
        try {
            const res = await api(`/api/orders/${orderId}/approve-delivery`, { method: "POST" });
            const data = await res.json();
            if (data.success) {
                // Reload order to update status to 'delivered'
                loadOrder();
            } else {
                alert(data.message || "Could not approve delivery");
            }
        } catch (err) {
            alert("Network error");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleOpenDispute = async () => {
        if (!reason.trim()) return alert("Please provide a reason.");
        setIsActionLoading(true);
        try {
            const res = await api(`/api/orders/${orderId}/dispute`, {
                method: "POST",
                body: JSON.stringify({ disputeReason: reason })
            });
            const data = await res.json();
            if (data.success) {
                setShowDisputeModal(false);
                loadOrder();
            }
        } finally {
            setIsActionLoading(false);
        }
    };

    if (loading) return <div className="p-20 text-center italic text-zinc-500 font-serif">Fetching order details...</div>;
    if (!order) return <div className="p-20 text-center text-red-500 font-bold">Order not found.</div>;

    const currentStatus = order.status?.toLowerCase();

    // Business logic for status visibility
    const isFinished = currentStatus === 'delivered' || currentStatus === 'cancelled';
    const isInDisputeFlow = currentStatus === 'disputed' || currentStatus === 'awaiting_return';
    const showApproveAction = !isFinished && !isInDisputeFlow && (currentStatus === 'paid' || currentStatus === 'shipped');

    return (
        <div className="max-w-4xl mx-auto p-6 pt-24 text-white mb-20 font-sans">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-8 hover:text-white transition-colors group"
            >
                <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> Back to my purchases
            </button>

            {/* Main Order Card */}
            <div className="bg-[#16302b] rounded-[3rem] p-8 md:p-12 border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-burgundy/10 blur-[100px] rounded-full -mr-32 -mt-32" />

                <div className="relative z-10">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-10">
                        <h1 className="text-3xl md:text-4xl font-serif font-black italic">Order Details</h1>
                        <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            currentStatus === 'delivered' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-white/5 border-white/10 text-zinc-400'
                        }`}>
                            {order.status.replace('_', ' ')}
                        </div>
                    </div>

                    {/* Product Summary */}
                    <div className="flex flex-col md:flex-row gap-8 mb-12 p-6 bg-black/20 rounded-[2rem] border border-white/5 items-center">
                        <div className="w-32 h-32 rounded-2xl overflow-hidden bg-zinc-900 shrink-0 shadow-xl">
                            <img src={order.product?.images?.[0] || "/images/ImagePlaceholder.jpg"} alt={order.product?.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-2xl font-bold mb-1">{order.product?.title}</h2>
                            <p className="text-burgundy-light text-2xl font-black">{order.totalAmount} DKK</p>
                            <p className="text-[9px] text-zinc-600 mt-2 font-mono uppercase tracking-tighter">Order ID: {order._id}</p>
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12 border-b border-white/5 pb-12">
                        <div className="space-y-4">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2 italic">
                                <Package size={12} /> Shipping Status
                            </p>
                            <div className="text-sm font-medium">
                                {order.shippingTrackingNumber ? (
                                    <a href={`https://tracking.shipmondo.com/${order.shippingTrackingNumber}`} target="_blank" className="text-burgundy-light underline hover:text-white transition-colors inline-flex items-center gap-2">
                                        Track via Shipmondo <ExternalLink size={14} />
                                    </a>
                                ) : (
                                    <span className="text-zinc-400 italic">Awaiting shipping label from seller</span>
                                )}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 italic">Support</p>
                            <p className="text-xs text-zinc-400 leading-relaxed">Having issues? Contact support or open a dispute before approving delivery.</p>
                        </div>
                    </div>

                    {/* Action Section */}
                    <div className="pt-6 space-y-6">
                        {showApproveAction && (
                            <>
                                <Button
                                    onClick={handleApproveDelivery}
                                    disabled={isActionLoading}
                                    className="bg-green-600 hover:bg-green-700 text-white py-8 rounded-2xl font-black uppercase tracking-[0.2em] w-full text-xs shadow-xl transition-all active:scale-[0.98]"
                                >
                                    {isActionLoading ? "Processing..." : "I have received the item & everything is OK"}
                                </Button>
                                <button
                                    onClick={() => setShowDisputeModal(true)}
                                    className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-burgundy-light hover:text-white transition-colors text-center"
                                >
                                    Open Dispute (I have a problem)
                                </button>
                            </>
                        )}

                        {/* Rating Section - Triggered when status is 'delivered' */}
                        {currentStatus === "delivered" && !hasRated && (
                            <OrderRating
                                orderId={orderId as string}
                                onSuccess={() => {
                                    setHasRated(true);
                                    loadOrder(); // Re-fetch to ensure UI consistency
                                }}
                            />
                        )}

                        {/* Post-Rating Feedback */}
                        {hasRated && currentStatus === "delivered" && (
                            <div className="flex flex-col items-center justify-center p-10 bg-green-500/5 rounded-[2rem] border border-green-500/10 text-center">
                                <CheckCircle2 size={32} className="text-green-400 mb-3" />
                                <p className="text-green-400 font-black uppercase tracking-widest text-sm">Transaction Completed & Reviewed</p>
                                <p className="text-[10px] text-zinc-500 mt-1 italic font-serif">Thank you for your feedback!</p>
                            </div>
                        )}

                        {/* Dispute Status Display */}
                        {currentStatus === "disputed" && (
                            <div className="p-8 bg-burgundy/5 rounded-[2rem] border border-burgundy/20 text-center">
                                <AlertTriangle size={32} className="mx-auto text-burgundy mb-4" />
                                <p className="text-burgundy font-black uppercase tracking-widest text-sm">Dispute under review</p>
                                <p className="text-[11px] text-zinc-400 mt-2 max-w-xs mx-auto italic">
                                    Our team is reviewing your claim. We will contact you shortly.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Dispute Modal */}
            {showDisputeModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4" onClick={() => setShowDisputeModal(false)}>
                    <div className="bg-[#16302b] border border-white/10 p-10 rounded-[3rem] max-w-lg w-full relative shadow-2xl" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowDisputeModal(false)} className="absolute top-8 right-8 text-zinc-500 hover:text-white"><X size={24} /></button>
                        <h2 className="text-3xl font-serif font-black mb-2 italic text-white">Open Dispute</h2>
                        <p className="text-[10px] text-zinc-500 mb-6 uppercase tracking-widest font-bold">Please describe the issue in detail</p>
                        <textarea
                            className="w-full bg-black/40 border border-white/10 rounded-[1.5rem] p-5 text-sm text-white h-44 mb-8 italic outline-none focus:border-burgundy transition-colors"
                            placeholder="Reason for dispute..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setShowDisputeModal(false)} className="py-5 rounded-2xl font-black uppercase text-[10px] bg-zinc-900 text-white hover:bg-black transition-colors tracking-widest">Cancel</button>
                            <button onClick={handleOpenDispute} disabled={isActionLoading} className="py-5 rounded-2xl font-black uppercase text-[10px] bg-burgundy text-white tracking-widest hover:brightness-110 transition-all">{isActionLoading ? "Sending..." : "Submit Dispute"}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}