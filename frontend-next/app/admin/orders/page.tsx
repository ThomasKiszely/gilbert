'use client';

import { useEffect, useState } from "react";
import { api } from "@/app/api/api";
import Link from "next/link"; // <-- Husk import!
import { ShoppingBag, AlertTriangle, RefreshCw, CheckCircle2, ChevronRight } from "lucide-react";

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        try {
            const res = await api("/api/admin/orders");
            const data = await res.json();
            if (data.success) setOrders(data.data);
        } catch (err) {
            console.error("Failed to load orders", err);
        } finally {
            setLoading(false);
        }
    }

    async function handleRetry(e: React.MouseEvent, orderId: string) {
        e.preventDefault(); // <-- Vigtigt! Forhindrer navigation til detaljesiden
        if (!confirm("Forsøg at genoprette shipping label?")) return;

        try {
            const res = await api(`/api/admin/orders/${orderId}/retry-shipping`, {
                method: "POST"
            });
            const data = await res.json();
            alert(data.data?.message || "Status opdateret");
            loadOrders();
        } catch (err) {
            alert("Der skete en fejl under retry");
        }
    }

    if (loading) return <div className="p-20 text-center font-serif italic text-racing-green">Henter ordrer...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6 mt-10">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-serif font-bold text-racing-green flex items-center gap-3">
                    <ShoppingBag className="text-burgundy" /> Order Management
                </h1>
            </div>

            <div className="space-y-4">
                {orders.map((order) => (
                    <div key={order._id} className="relative group">
                        {/* Selve kortet som et Link */}
                        <Link
                            href={`/admin/orders/${order._id}`}
                            className={`block p-6 rounded-2xl border transition-all bg-white shadow-sm hover:border-burgundy/30 hover:shadow-md ${order.shippingError ? 'border-red-200 bg-red-50/30' : 'border-ivory-dark'}`}
                        >
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                {/* Venstre side: Ordre info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[10px] font-mono bg-zinc-100 px-2 py-0.5 rounded text-zinc-500">#{order._id.slice(-6).toUpperCase()}</span>
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                            order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-600'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-racing-green group-hover:text-burgundy transition-colors">{order.product?.title || "Product Deleted"}</h3>
                                    <p className="text-xs text-brown/70 mt-1">
                                        Seller: <span className="font-semibold">{order.seller?.username}</span> →
                                        Buyer: <span className="font-semibold">{order.buyer?.username}</span>
                                    </p>
                                </div>

                                {/* Midte: Shipping Status */}
                                <div className="flex-1 flex flex-col justify-center">
                                    {order.shippingError ? (
                                        <div className="flex items-start gap-2 text-red-600">
                                            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                                            <p className="text-xs font-medium leading-tight">Error: {order.shippingError}</p>
                                        </div>
                                    ) : order.shipmondoShipmentId ? (
                                        <div className="flex items-center gap-2 text-green-600 text-xs font-medium">
                                            <CheckCircle2 size={16} /> Label Created
                                        </div>
                                    ) : (
                                        <p className="text-xs text-zinc-400 italic">No shipment initiated</p>
                                    )}
                                </div>

                                {/* Højre side: Beløb & Action */}
                                <div className="flex flex-col items-end justify-between min-w-[120px]">
                                    <div className="flex items-center gap-2">
                                        <p className="text-xl font-black text-burgundy">{order.totalAmount} DKK</p>
                                        <ChevronRight size={18} className="text-zinc-300 group-hover:text-burgundy transition-all translate-x-0 group-hover:translate-x-1" />
                                    </div>

                                    {order.shippingError && (
                                        <button
                                            onClick={(e) => handleRetry(e, order._id)}
                                            className="relative z-10 flex items-center gap-2 bg-burgundy text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-burgundy-dark transition-colors mt-2"
                                        >
                                            <RefreshCw size={14} /> Retry Label
                                        </button>
                                    )}
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}

                {orders.length === 0 && (
                    <div className="text-center p-20 bg-ivory rounded-3xl border border-dashed border-brown/20">
                        <p className="text-brown/50 italic font-serif">Ingen ordrer fundet i systemet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}