"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import StripePayment from "./StripePayment";
import { Button } from "@/app/components/UI/button";
import { useAuth } from "@/app/context/AuthContext";
import { AlertTriangle, X, ExternalLink, ShieldAlert } from "lucide-react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
    const { productId } = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const [product, setProduct] = useState<any>(null);
    const [clientSecret, setClientSecret] = useState("");
    const [orderId, setOrderId] = useState("");
    const [loading, setLoading] = useState(true);
    const [isPreparing, setIsPreparing] = useState(false);

    // Error Modal State
    const [stripeError, setStripeError] = useState<string | null>(null);

    const [address, setAddress] = useState({
        name: "",
        street: "",
        houseNumber: "",
        city: "",
        zip: "",
        country: "Denmark"
    });

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/${productId}`);
                if (res.ok) {
                    const data = await res.json();
                    setProduct(data.product || data);
                }
            } catch (err) {
                console.error("Error fetching product:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    const handlePreparePayment = async () => {
        if (!user) {
            router.push("/login");
            return;
        }

        if (!address.name || !address.street || !address.houseNumber || !address.zip || !address.city) {
            alert("Please fill in all shipping details.");
            return;
        }

        setIsPreparing(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    productId,
                    address,
                    bidId: null,
                    wantAuth: false
                })
            });

            const data = await res.json();

            if (!res.ok) {
                // ⭐ FANG DEN SPECIFIKKE STRIPE FEJL HER
                if (data.requiresSellerStripeReconnect) {
                    setStripeError("The seller's Stripe account is currently inactive. They must reconnect their account before this item can be purchased.");
                } else {
                    alert(data.error || data.message || "Failed to initiate order");
                }
                return;
            }

            setClientSecret(data.clientSecret);
            setOrderId(data.order._id);

        } catch (err) {
            console.error("Payment preparation failed:", err);
            alert("An error occurred connecting to the server.");
        } finally {
            setIsPreparing(false);
        }
    };

    if (loading) return <div className="p-20 text-center text-zinc-500 font-mono uppercase text-xs tracking-widest text-white">Loading order details...</div>;
    if (!product) return <div className="p-20 text-center text-zinc-500 text-white">Product not found.</div>;

    return (
        <div className="max-w-5xl mx-auto p-6 pt-24 min-h-screen relative">

            {/* --- CUSTOM STRIPE ERROR MODAL --- */}
            {stripeError && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                    <div className="bg-[#16302b] border border-white/10 w-full max-w-lg rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-burgundy/20 blur-3xl -mr-16 -mt-16" />

                        <button onClick={() => setStripeError(null)} className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors">
                            <X size={24} />
                        </button>

                        <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                            <div className="w-20 h-20 bg-burgundy/10 rounded-full flex items-center justify-center border border-burgundy/20">
                                <ShieldAlert size={40} className="text-burgundy-light" />
                            </div>

                            <div>
                                <h3 className="text-2xl font-serif font-black italic text-white mb-2">Merchant Action Required</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed italic font-serif">
                                    {stripeError}
                                </p>
                            </div>

                            <div className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-left">
                                <p className="text-[10px] uppercase tracking-widest font-black text-zinc-500 mb-2">Share help-link with seller:</p>
                                <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5">
                                    <code className="text-[10px] text-burgundy-light truncate mr-4">
                                        {typeof window !== 'undefined' ? `${window.location.origin}/settings/payouts` : ""}
                                    </code>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(`${window.location.origin}/settings/payouts`);
                                            alert("Link copied!");
                                        }}
                                        className="text-[9px] font-black uppercase tracking-widest text-white hover:text-burgundy-light transition-colors shrink-0"
                                    >
                                        Copy Link
                                    </button>
                                </div>
                            </div>

                            <Button
                                onClick={() => setStripeError(null)}
                                className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-200"
                            >
                                Understood
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* LEFT SIDE */}
                <div className="space-y-8">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-burgundy-light">
                        {clientSecret ? "Secure Payment" : "Shipping Details"}
                    </h2>

                    {!clientSecret ? (
                        <div className="space-y-4 bg-white/5 p-8 rounded-[2rem] border border-white/10 shadow-2xl">
                            <input
                                className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white focus:border-burgundy outline-none transition-all italic font-serif"
                                placeholder="Full Name"
                                value={address.name}
                                onChange={e => setAddress({...address, name: e.target.value})}
                            />

                            <div className="flex gap-4">
                                <input
                                    className="flex-[3] bg-black/40 border border-white/10 p-4 rounded-xl text-white focus:border-burgundy outline-none transition-all italic font-serif"
                                    placeholder="Street Name"
                                    value={address.street}
                                    onChange={e => setAddress({...address, street: e.target.value})}
                                />
                                <input
                                    className="flex-1 bg-black/40 border border-white/10 p-4 rounded-xl text-white focus:border-burgundy outline-none transition-all text-center font-mono"
                                    placeholder="No."
                                    value={address.houseNumber}
                                    onChange={e => setAddress({...address, houseNumber: e.target.value})}
                                />
                            </div>

                            <div className="flex gap-4">
                                <input
                                    className="w-1/3 bg-black/40 border border-white/10 p-4 rounded-xl text-white focus:border-burgundy outline-none transition-all font-mono"
                                    placeholder="Zip Code"
                                    maxLength={4}
                                    value={address.zip}
                                    onChange={e => setAddress({...address, zip: e.target.value})}
                                />
                                <input
                                    className="flex-1 bg-black/40 border border-white/10 p-4 rounded-xl text-white focus:border-burgundy outline-none transition-all italic font-serif"
                                    placeholder="City"
                                    value={address.city}
                                    onChange={e => setAddress({...address, city: e.target.value})}
                                />
                            </div>

                            <Button
                                onClick={handlePreparePayment}
                                disabled={isPreparing}
                                className="w-full bg-white hover:bg-zinc-200 text-black py-8 rounded-2xl text-lg font-bold uppercase tracking-widest mt-4 shadow-xl transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isPreparing ? "Preparing Order..." : "Continue to Payment"}
                            </Button>
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-[2rem] shadow-2xl">
                            <Elements stripe={stripePromise} options={{ clientSecret }}>
                                <StripePayment orderId={orderId} clientSecret={clientSecret} />
                            </Elements>
                        </div>
                    )}
                </div>

                {/* RIGHT SIDE (Order Summary) */}
                <div className="bg-[#16302b] rounded-[3rem] p-10 border border-white/5 shadow-2xl h-fit lg:sticky lg:top-24 text-white">
                    <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-zinc-500 mb-8">Order Summary</h3>

                    <div className="flex gap-6 mb-8 items-center">
                        <div className="w-24 h-24 bg-black/20 rounded-2xl overflow-hidden border border-white/10">
                            {product.images?.[0] && (
                                <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                            )}
                        </div>
                        <div>
                            <p className="font-bold text-lg leading-tight">{product.title}</p>
                            <p className="text-burgundy-light font-black text-2xl mt-1">{product.price} DKK</p>
                        </div>
                    </div>

                    <div className="space-y-3 py-6 border-y border-white/5 mb-6">
                        <div className="flex justify-between text-sm italic font-serif">
                            <span className="text-zinc-400">Subtotal</span>
                            <span className="font-bold">{product.price} DKK</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-black text-green-400 uppercase tracking-widest">
                            <span>Shipping</span>
                            <span>Insured & Tracked</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-lg font-bold uppercase tracking-tighter">Total Amount</span>
                        <span className="text-3xl font-black">{product.price} DKK</span>
                    </div>

                    <p className="text-[10px] text-zinc-500 mt-8 leading-relaxed italic font-serif">
                        By proceeding, you agree to the escrow terms. Your money is only released to the seller once you've confirmed receipt of the item.
                    </p>
                </div>
            </div>
        </div>
    );
}