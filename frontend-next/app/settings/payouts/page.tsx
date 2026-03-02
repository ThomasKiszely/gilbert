'use client';

import { useEffect, useState } from "react";
import { api } from "@/app/api/api";
import { useAuth } from "@/app/context/AuthContext";
import { useSearchParams } from "next/navigation";
import { Button } from "@/app/components/UI/button";
import { CreditCard, CheckCircle2, AlertCircle, ArrowRight, ExternalLink, Info } from "lucide-react";

export default function PayoutSettings() {
    // Her bruger vi checkAuth fra din Provider
    const { user, checkAuth } = useAuth();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const success = searchParams.get("success");

    async function handleConnectStripe() {
        setLoading(true);
        try {
            const res = await api("/api/stripe/connect", { method: "POST" });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (err) {
            console.error(err);
            alert("Could not connect to Stripe.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (success) {
            checkAuth(); // Opdaterer brugeren når vi kommer tilbage fra Stripe
        }
    }, [success]);

    return (
        <div className="max-w-3xl mx-auto p-6 pt-24 mb-20 font-sans text-racing-green">
            <div className="bg-ivory rounded-[3rem] p-10 md:p-16 border border-ivory-dark shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-racing-green/5 blur-[100px] rounded-full -mr-32 -mt-32" />

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-black mb-2 italic">Seller Dashboard</p>
                            <h1 className="text-4xl md:text-5xl font-serif font-black italic">Payout Settings</h1>
                        </div>
                        <div className="p-4 bg-white rounded-2xl border border-ivory-dark shadow-sm">
                            <CreditCard size={32} className="text-racing-green" />
                        </div>
                    </div>

                    {success && (
                        <div className="p-6 mb-10 bg-green-500/10 border border-green-500/20 rounded-[2rem] flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
                            <CheckCircle2 className="text-green-600 shrink-0" size={24} />
                            <p className="text-sm font-bold text-green-800">
                                Your Stripe account is now connected! You are ready to receive payouts.
                            </p>
                        </div>
                    )}

                    <section className="space-y-8">
                        <div className="p-8 bg-white border border-ivory-dark rounded-[2.5rem] shadow-sm">
                            <h3 className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-black mb-6 italic flex items-center gap-2">
                                <Info size={14} /> Connection Status
                            </h3>

                            {user?.stripeAccountId ? (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                                            <CheckCircle2 className="text-green-600" size={24} />
                                        </div>
                                        <div>
                                            <p className="text-xl font-serif font-bold italic">Stripe Connected</p>
                                            <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Account ID: {user.stripeAccountId}</p>
                                        </div>
                                    </div>

                                    <p className="text-sm text-zinc-600 leading-relaxed max-w-md italic">
                                        Your account is fully integrated. Payouts will be automatically processed and sent to your bank account via Stripe.
                                    </p>

                                    <div className="pt-4">
                                        <Button
                                            variant="outline"
                                            className="border-racing-green text-racing-green hover:bg-racing-green hover:text-white rounded-full px-8 py-6 text-[10px] uppercase tracking-widest font-black"
                                            onClick={() => window.open('https://dashboard.stripe.com/', '_blank')}
                                        >
                                            View Stripe Dashboard <ExternalLink size={14} className="ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-burgundy/10 flex items-center justify-center">
                                            <AlertCircle className="text-burgundy" size={24} />
                                        </div>
                                        <div>
                                            <p className="text-xl font-serif font-bold italic">Action Required</p>
                                            <p className="text-xs text-burgundy uppercase tracking-widest font-bold font-sans">Not Connected</p>
                                        </div>
                                    </div>

                                    <p className="text-sm text-zinc-600 leading-relaxed max-w-md italic">
                                        To list products and receive payments, you need to connect your account to our payment provider, Stripe. This ensures safe and fast transactions.
                                    </p>

                                    <Button
                                        onClick={handleConnectStripe}
                                        disabled={loading}
                                        className="bg-racing-green text-white hover:brightness-110 rounded-full px-10 py-8 text-[11px] uppercase tracking-[0.2em] font-black shadow-xl shadow-racing-green/20 transition-all active:scale-95"
                                    >
                                        {loading ? "Redirecting to Stripe..." : "Connect Stripe Account"}
                                        <ArrowRight size={16} className="ml-3" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-racing-green/5 rounded-[2.5rem] border border-racing-green/10">
                            <h4 className="text-[10px] uppercase tracking-[0.2em] text-racing-green/60 font-black mb-3 italic">Security & Privacy</h4>
                            <p className="text-[11px] text-racing-green/70 leading-relaxed italic font-serif">
                                We use Stripe for all financial transactions. We never store your bank details or sensitive financial information on our own servers.
                                Securely managed, globally trusted.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}