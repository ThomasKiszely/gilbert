"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Package, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/app/components/UI/button";

export default function OrderSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderId = searchParams.get("orderId");
    const [loading, setLoading] = useState(true);

    // We can fetch order details here if we want to show specific info
    useEffect(() => {
        if (orderId) {
            setLoading(false);
        }
    }, [orderId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="animate-pulse font-mono text-zinc-500 uppercase tracking-[0.3em] text-xs">
                    Verifying Payment...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pt-32 pb-20 px-6">
            <div className="max-w-3xl mx-auto text-center">
                {/* SUCCESS ICON */}
                <div className="flex justify-center mb-8">
                    <div className="relative">
                        <div className="absolute inset-0 bg-[#800020] blur-3xl opacity-20 animate-pulse" />
                        <CheckCircle2 className="h-24 w-24 text-[#800020] relative z-10" />
                    </div>
                </div>

                <h1 className="text-5xl font-black uppercase italic tracking-tighter mb-4">
                    Order Secured
                </h1>
                <p className="text-zinc-400 text-lg max-w-md mx-auto mb-12">
                    Your payment is now held safely in escrow. The seller has been notified to prepare your package.
                </p>

                {/* STATUS CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 text-left">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem]">
                        <ShieldCheck className="h-6 w-6 text-[#800020] mb-4" />
                        <h3 className="font-bold mb-2">Escrow Protected</h3>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                            Funds are held by Gilbert until you confirm delivery of the item.
                        </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem]">
                        <Package className="h-6 w-6 text-[#800020] mb-4" />
                        <h3 className="font-bold mb-2">Shipping Next</h3>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                            The seller has 3 business days to drop off the package at a Shipmondo point.
                        </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem]">
                        <div className="h-6 w-6 rounded-full bg-[#800020]/20 flex items-center justify-center mb-4">
                            <span className="text-[10px] font-bold text-[#800020]">ID</span>
                        </div>
                        <h3 className="font-bold mb-2">Order Reference</h3>
                        <p className="text-xs font-mono text-zinc-400 break-all">
                            {orderId || "N/A"}
                        </p>
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        onClick={() => router.push("/profile/orders")}
                        className="bg-white text-black hover:bg-zinc-200 px-10 py-8 rounded-2xl font-bold uppercase tracking-widest flex items-center gap-2"
                    >
                        View My Orders <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button
                        onClick={() => router.push("/")}
                        variant="outline"
                        className="border-white/10 text-white hover:bg-white/5 px-10 py-8 rounded-2xl font-bold uppercase tracking-widest"
                    >
                        Continue Shopping
                    </Button>
                </div>

                {/* SUPPORT INFO */}
                <p className="mt-20 text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-bold">
                    Questions about your order? <span className="text-[#800020] cursor-pointer hover:underline">Contact Support</span>
                </p>
            </div>
        </div>
    );
}