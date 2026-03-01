'use client';

import { useEffect, useState } from "react";
import { api } from "@/app/api/api";
import Link from "next/link";
import {
    Fingerprint,
    Search,
    ChevronRight,
    ArrowLeft,
    Clock,
    ShieldCheck,
    Truck
} from "lucide-react";

export default function AdminAuthenticationPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAuthQueue();
    }, []);

    async function loadAuthQueue() {
        try {
            // Vi henter ordrer der kræver din handling
            // status 'received_by_admin' = mangler tjek
            // status 'auth_passed' = tjekket, men mangler at blive sendt til køber
            const res = await api('/api/admin/orders?status=received_by_admin,auth_passed');
            const data = await res.json();
            if (data.success) {
                setOrders(data.data);
            }
        } catch (err) {
            console.error("Error loading auth queue", err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div className="p-20 text-center italic text-racing-green font-serif">Accessing vault...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6 mt-10 mb-20 font-sans text-racing-green">
            <Link href="/admin" className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-zinc-400 hover:text-racing-green transition mb-12 font-black">
                <ArrowLeft size={14} /> Dashboard
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Fingerprint className="text-racing-green" size={32} />
                        <h1 className="text-5xl font-serif font-black italic">Authentication</h1>
                    </div>
                    <p className="text-sm text-zinc-500 mt-2 font-medium italic">Verify items and manage outbound shipping</p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-ivory border border-ivory-dark px-8 py-4 rounded-[2rem] shadow-sm">
                        <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">To Verify</p>
                        <p className="text-2xl font-black font-serif italic text-racing-green">
                            {orders.filter(o => o.status === 'received_by_admin').length}
                        </p>
                    </div>
                    <div className="bg-zinc-900 text-ivory px-8 py-4 rounded-[2rem] shadow-xl">
                        <p className="text-[9px] uppercase tracking-widest opacity-60 font-bold">To Ship</p>
                        <p className="text-2xl font-black font-serif italic">
                            {orders.filter(o => o.status === 'auth_passed').length}
                        </p>
                    </div>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="bg-ivory/50 border border-dashed border-ivory-dark rounded-[3.5rem] p-32 text-center">
                    <ShieldCheck size={48} className="mx-auto mb-4 text-zinc-200" />
                    <h2 className="text-xl font-serif font-bold italic text-zinc-400">Queue is empty</h2>
                </div>
            ) : (
                <div className="grid gap-4">
                    {orders.map((order) => (
                        <Link
                            key={order._id}
                            href={`/admin/orders/${order._id}`}
                            className="group bg-white border border-ivory-dark p-6 rounded-[2.5rem] hover:shadow-xl transition-all flex flex-col md:flex-row items-center gap-6"
                        >
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
                                order.status === 'auth_passed' ? 'bg-racing-green text-white' : 'bg-ivory text-racing-green'
                            }`}>
                                {order.status === 'auth_passed' ? <Truck size={24} /> : <Search size={24} />}
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                    <span className="text-[10px] font-mono font-bold text-zinc-400">#{order._id.slice(-6).toUpperCase()}</span>
                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                                        order.status === 'auth_passed' ? 'bg-zinc-100 text-zinc-500' : 'bg-burgundy text-white'
                                    }`}>
                                        {order.status === 'auth_passed' ? 'Awaiting Shipment' : 'Pending Verification'}
                                    </span>
                                </div>
                                <h3 className="font-serif font-bold text-xl italic">{order.product?.title}</h3>
                            </div>

                            <div className="flex items-center gap-8">
                                <div className="text-right">
                                    <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold mb-1">Value</p>
                                    <p className="text-xl font-black font-serif italic">{order.totalAmount} DKK</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-ivory flex items-center justify-center text-zinc-300 group-hover:bg-racing-green group-hover:text-white transition-all">
                                    <ChevronRight size={18} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}