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
    CreditCard,
    Fingerprint,
    Info,
    Download
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
            console.error("Error fetching order", err);
        } finally {
            setLoading(false);
        }
    }

    // --- AUTHENTICATION FLOW: APPROVE ---
    async function handleApproveAuthentication() {
        if (!confirm("Approve authentication and generate shipping label to the buyer?")) return;

        setIsActionLoading(true);
        try {
            const res = await api(`/api/authentication/${id}/approve`, {
                method: 'POST'
            });

            const data = await res.json();

            if (res.ok) {
                alert("Authentication approved. Shipping label created.");
                await loadOrder();
            } else {
                alert(data.error || "Something went wrong.");
            }
        } finally {
            setIsActionLoading(false);
        }
    }

    // --- AUTHENTICATION FLOW: FAIL ---
    async function handleFailAuthentication() {
        const notes = prompt("Why did it fail? This will be sent to buyer and seller:");
        if (!notes) return;

        setIsActionLoading(true);
        try {
            const res = await api(`/api/authentication/${id}/fail`, {
                method: 'POST',
                body: JSON.stringify({ notes })
            });
            const data = await res.json();
            if (res.ok) {
                alert("Authentication failed. Return label created and seller notified.");
                await loadOrder();
            } else {
                alert(data.error || "Something went wrong.");
            }
        } finally {
            setIsActionLoading(false);
        }
    }

    // --- MARK DELIVERED LOGIC ---
    async function handleMarkAsDelivered() {
        if (!confirm("Confirm that the item has been delivered? This starts the 72-hour review timer (or completes return).")) return;

        setIsActionLoading(true);
        try {
            const res = await api(`/api/admin/orders/${id}/mark-delivered`, {
                method: 'POST'
            });
            if (res.ok) {
                alert("Order marked as delivered.");
                await loadOrder();
            }
        } finally {
            setIsActionLoading(false);
        }
    }

    // --- DISPUTE & SHIPPING LOGIC ---
    async function handleRetryShipping() {
        if (!confirm("Attempt to generate a new shipping label?")) return;
        setIsActionLoading(true);
        try {
            const res = await api(`/api/admin/orders/${id}/retry-shipping`, { method: "POST" });
            if (res.ok) {
                alert("Shipping label retry initiated.");
                await loadOrder();
            }
        } finally {
            setIsActionLoading(false);
        }
    }

    async function handleResolve(decision: 'refund_buyer' | 'payout_seller') {
        if (!adminNote.trim()) return alert("Please provide a reason.");
        setIsActionLoading(true);
        try {
            const res = await api(`/api/admin/orders/${id}/resolve-dispute`, {
                method: "POST",
                body: JSON.stringify({ resolution: decision, reason: adminNote })
            });
            if (res.ok) {
                alert("Dispute resolved!");
                setShowResolveModal(false);
                setAdminNote("");
                await loadOrder();
            }
        } finally {
            setIsActionLoading(false);
        }
    }

    if (loading) return <div className="p-20 text-center italic text-racing-green font-serif">Loading case files...</div>;
    if (!order) return <div className="p-20 text-center text-red-600 font-bold">Order not found.</div>;

    const currentStatus = order.status || "";
    const isOrderOpen = currentStatus !== 'completed' && currentStatus !== 'cancelled';
    const showDisputeButtons = isOrderOpen && (currentStatus === 'disputed' || currentStatus === 'awaiting_return');
    const showShippingRetry = isOrderOpen && !!order.shippingError;

    // Tjekker om der findes en label
    const hasLabel = !!order.shippingLabelUrl;
    // Er det en returforsendelse til sælger?
    const isReturningToSeller = order.authenticationStatus === 'failed' || currentStatus === 'auth_failed';

    return (
        <div className="max-w-6xl mx-auto p-6 mt-10 mb-20 font-sans text-racing-green">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-400 hover:text-racing-green transition mb-8 font-bold text-[10px] uppercase tracking-widest">
                <ArrowLeft size={14} /> Back to list
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: ORDER INFO */}
                <div className="lg:col-span-2 space-y-8">

                    <section className="bg-ivory p-10 rounded-[3rem] border border-ivory-dark shadow-sm">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-tighter">ORDER REF: {order._id.toUpperCase()}</span>
                                <h1 className="text-4xl font-serif font-black italic mt-2">{order.product?.title || "Unknown Product"}</h1>
                            </div>
                            <div className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                currentStatus === 'disputed' || currentStatus === 'auth_failed' ? 'bg-burgundy text-white' :
                                    currentStatus === 'auth_passed' || currentStatus === 'shipped_to_buyer' ? 'bg-racing-green text-white' : 'bg-zinc-800 text-white'
                            }`}>
                                {currentStatus.replace(/_/g, ' ')}
                            </div>
                        </div>

                        {/* VIS DUMP-GRUND HVIS AUTH FAILED */}
                        {order.authenticationNotes && (
                            <div className="mb-10 p-8 bg-zinc-100 border-l-4 border-zinc-800 rounded-r-3xl">
                                <h4 className="text-[10px] font-black text-zinc-800 uppercase flex items-center gap-2 mb-3 tracking-widest italic">
                                    <ShieldCheck size={16} /> Authentication Report (Fail):
                                </h4>
                                <p className="text-lg italic font-serif text-zinc-700">"{order.authenticationNotes}"</p>
                            </div>
                        )}

                        {order.disputeReason && (
                            <div className="mb-10 p-8 bg-burgundy/5 border-l-4 border-burgundy rounded-r-3xl">
                                <h4 className="text-[10px] font-black text-burgundy uppercase flex items-center gap-2 mb-3 tracking-widest italic">
                                    <AlertCircle size={16} /> Buyer's Dispute Reason:
                                </h4>
                                <p className="text-lg italic font-serif text-zinc-700">"{order.disputeReason}"</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-ivory-dark/50">
                            <div>
                                <h4 className="text-[9px] font-bold uppercase text-zinc-400 mb-2 tracking-widest flex items-center gap-2">
                                    <CreditCard size={12} /> Total Amount
                                </h4>
                                <p className="text-2xl font-black">{order.totalAmount} DKK</p>
                            </div>
                            <div>
                                <h4 className="text-[9px] font-bold uppercase text-zinc-400 mb-2 tracking-widest flex items-center gap-2">
                                    <Fingerprint size={12} /> Auth Status
                                </h4>
                                <p className="text-sm font-bold uppercase tracking-tight">{order.authenticationStatus || 'Pending'}</p>
                            </div>
                            <div>
                                <h4 className="text-[9px] font-bold uppercase text-zinc-400 mb-2 tracking-widest flex items-center gap-2">
                                    <Truck size={12} /> Shipping
                                </h4>
                                <p className="text-xs font-medium text-zinc-600 truncate">{order.shippingTrackingNumber || 'No label generated'}</p>
                            </div>
                        </div>

                        {/* VIS LABEL OG TRACKING NÅR DEN ER KLAR */}
                        {(hasLabel) && (
                            <div className="mt-8 pt-8 border-t border-ivory-dark/50 space-y-4">
                                <div className="flex flex-wrap gap-4 items-center justify-between bg-white/50 p-6 rounded-2xl border border-ivory-dark/30">
                                    <div>
                                        <h4 className="text-[9px] font-bold uppercase text-zinc-400 mb-1 tracking-widest italic">
                                            {isReturningToSeller ? 'Return Tracking (to Seller)' : 'Outbound Tracking (to Buyer)'}
                                        </h4>
                                        <p className="text-sm font-black font-mono">{order.shippingTrackingNumber}</p>
                                    </div>
                                    <button
                                        onClick={() => window.open(`/api/orders/${order._id}/label`, '_blank')}
                                        className={`flex items-center gap-2 px-6 py-3 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md ${
                                            isReturningToSeller ? 'bg-zinc-800 hover:bg-black' : 'bg-zinc-900 hover:bg-racing-green'
                                        }`}
                                    >
                                        <Download size={14} /> Download {isReturningToSeller ? 'Return' : 'Shipping'} Label
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white border border-ivory-dark p-8 rounded-[2.5rem]">
                            <h4 className="text-[10px] font-black uppercase text-zinc-400 mb-4 tracking-widest flex items-center gap-2 italic">
                                <User size={14} /> Seller
                            </h4>
                            <p className="font-serif font-bold text-xl">{order.seller?.username}</p>
                            <p className="text-xs text-zinc-500">{order.seller?.email}</p>
                        </div>
                        <div className="bg-white border border-ivory-dark p-8 rounded-[2.5rem]">
                            <h4 className="text-[10px] font-black uppercase text-zinc-400 mb-4 tracking-widest flex items-center gap-2 italic">
                                <User size={14} /> Buyer
                            </h4>
                            <p className="font-serif font-bold text-xl">{order.buyer?.username}</p>
                            <p className="text-xs text-zinc-500">{order.buyer?.email}</p>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: ADMIN DESK */}
                <div className="space-y-6">
                    <div className="bg-racing-green text-ivory p-8 rounded-[3rem] shadow-xl sticky top-10">
                        <h3 className="font-bold mb-8 uppercase text-[10px] tracking-[0.2em] border-b border-white/10 pb-4 italic text-center text-white/60">Admin Desk</h3>

                        <div className="space-y-4">

                            {/* AUTHENTICATION ACTIONS */}
                            {currentStatus === 'received_by_admin' && order.authenticationStatus === 'pending' && (
                                <div className="space-y-3 pb-4 border-b border-white/10">
                                    <p className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-black text-center mb-1">Verify Product</p>
                                    <button
                                        onClick={handleApproveAuthentication}
                                        disabled={isActionLoading}
                                        className="w-full py-4 bg-white text-racing-green rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-ivory transition-all shadow-lg"
                                    >
                                        Approve Authentication
                                    </button>
                                    <button
                                        onClick={handleFailAuthentication}
                                        disabled={isActionLoading}
                                        className="w-full py-3 bg-transparent border border-burgundy text-burgundy rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-burgundy/10 transition-all"
                                    >
                                        Reject (Counterfeit)
                                    </button>
                                </div>
                            )}

                            {/* LOGISTICS ACTIONS (VISES VED BÅDE PASS OG FAIL) */}
                            {(currentStatus === 'auth_passed' || currentStatus === 'auth_failed') && (
                                <div className="space-y-3 pb-4">
                                    <p className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-black text-center mb-1">Logistics</p>

                                    {hasLabel && (
                                        <button
                                            onClick={() => window.open(`/api/orders/${order._id}/label`, '_blank')}
                                            className="w-full py-4 bg-white/10 border border-white/20 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-3 mb-2"
                                        >
                                            <Download size={16} /> Print {isReturningToSeller ? 'Return' : ''} Label
                                        </button>
                                    )}

                                    <button
                                        onClick={handleMarkAsDelivered}
                                        className="w-full py-5 bg-white text-racing-green rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-xl"
                                    >
                                        <Truck size={18} />
                                        Mark as {isReturningToSeller ? 'Returned' : 'Delivered'}
                                    </button>
                                </div>
                            )}

                            {/* DISPUTE ACTIONS */}
                            {showDisputeButtons && (
                                <div className="space-y-3 pt-2">
                                    <p className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-black text-center mb-1">Dispute Management</p>
                                    <button
                                        onClick={() => { setModalMode('resolve'); setShowResolveModal(true); }}
                                        className="w-full py-5 bg-burgundy text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-lg"
                                    >
                                        <Gavel size={18} />
                                        Resolve Dispute
                                    </button>
                                </div>
                            )}

                            {/* ERROR HANDLING */}
                            {showShippingRetry && (
                                <button
                                    onClick={handleRetryShipping}
                                    className="w-full py-4 bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-3"
                                >
                                    <RefreshCw size={16} className={isActionLoading ? "animate-spin" : ""} />
                                    Retry Label
                                </button>
                            )}

                            {/* CLOSED STATE */}
                            {!showDisputeButtons && currentStatus !== 'received_by_admin' && currentStatus !== 'auth_passed' && currentStatus !== 'auth_failed' && !showShippingRetry && (
                                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 bg-white/5 rounded-[2.5rem] italic">
                                    <ShieldCheck size={48} className="text-white/10" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Case Closed</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* RESOLVE MODAL */}
            {showResolveModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-6">
                    <div className="bg-white rounded-[3.5rem] p-12 max-w-xl w-full shadow-2xl relative">
                        <button onClick={() => setShowResolveModal(false)} className="absolute top-10 right-10 text-zinc-300 hover:text-racing-green">
                            <X size={28} />
                        </button>

                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-serif font-black text-racing-green mb-2 italic">Final Decision</h2>
                            <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-black">Choose who receives the funds</p>
                        </div>

                        <textarea
                            className="w-full border-2 border-ivory-dark rounded-[2rem] p-6 text-base focus:border-burgundy outline-none h-40 mb-8 bg-ivory/30 italic font-serif"
                            placeholder="Reason for decision (sent to both parties)..."
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                        />

                        <div className="grid grid-cols-1 gap-4">
                            <button onClick={() => handleResolve('payout_seller')} className="w-full py-5 bg-racing-green text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em]">Payout Seller</button>
                            <button onClick={() => handleResolve('refund_buyer')} className="w-full py-5 bg-burgundy text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em]">Refund Buyer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}