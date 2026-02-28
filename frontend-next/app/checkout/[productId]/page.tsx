"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import StripePayment from "./StripePayment";
import { Button } from "@/app/components/UI/button";

// Load Stripe outside of component.
// Make sure NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is in your frontend .env.local
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
    const { productId } = useParams();
    const router = useRouter();

    const [product, setProduct] = useState<any>(null);
    const [clientSecret, setClientSecret] = useState("");
    const [orderId, setOrderId] = useState("");
    const [loading, setLoading] = useState(true);

    // Address state matching your backend validateAddress expectations
    const [address, setAddress] = useState({
        name: "",
        street: "",
        houseNumber: "",
        city: "",
        zip: "",
        country: "Denmark"
    });

    // 1. Fetch product details
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

    // 2. Create order in backend
    const handlePreparePayment = async () => {
        // Simple frontend validation to prevent unnecessary 400 errors
        if (!address.name || !address.street || !address.houseNumber || !address.zip || !address.city) {
            alert("Please fill in all shipping details.");
            return;
        }

        try {
            // This calls your Next.js proxy route (app/api/orders/route.ts)
            // Which then forwards to Express: POST /api/orders/create
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId,
                    address,
                    // bidId: null, // Optional: Add if you have a bid flow
                    // wantAuth: false // Optional: Add if user toggles authentication
                })
            });

            const data = await res.json();

            if (res.ok) {
                // Your backend returns { order, clientSecret }
                setClientSecret(data.clientSecret);
                setOrderId(data.order?._id || data.orderId);
            } else {
                // Show the specific error from your backend (e.g., "Zip code must be 4 digits")
                alert(data.error || data.message || "Failed to initiate order");
            }
        } catch (err) {
            console.error("Payment preparation failed:", err);
            alert("An error occurred connecting to the server.");
        }
    };

    if (loading) return <div className="p-20 text-center text-zinc-500 font-mono uppercase text-xs tracking-widest text-white">Loading order details...</div>;
    if (!product) return <div className="p-20 text-center text-zinc-500 text-white">Product not found.</div>;

    return (
        <div className="max-w-5xl mx-auto p-6 pt-24 min-h-screen">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* LEFT SIDE: Address or Stripe Payment */}
                <div className="space-y-8">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-[#800020]">
                        {clientSecret ? "Secure Payment" : "Shipping Details"}
                    </h2>

                    {!clientSecret ? (
                        <div className="space-y-4 bg-white/5 p-8 rounded-[2rem] border border-white/10 shadow-2xl">
                            <input
                                className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white focus:border-[#800020] outline-none transition-all"
                                placeholder="Full Name"
                                value={address.name}
                                onChange={e => setAddress({...address, name: e.target.value})}
                            />

                            <div className="flex gap-4">
                                <input
                                    className="flex-[3] bg-black/40 border border-white/10 p-4 rounded-xl text-white focus:border-[#800020] outline-none transition-all"
                                    placeholder="Street Name"
                                    value={address.street}
                                    onChange={e => setAddress({...address, street: e.target.value})}
                                />
                                <input
                                    className="flex-1 bg-black/40 border border-white/10 p-4 rounded-xl text-white focus:border-[#800020] outline-none transition-all text-center"
                                    placeholder="No."
                                    value={address.houseNumber}
                                    onChange={e => setAddress({...address, houseNumber: e.target.value})}
                                />
                            </div>

                            <div className="flex gap-4">
                                <input
                                    className="w-1/3 bg-black/40 border border-white/10 p-4 rounded-xl text-white focus:border-[#800020] outline-none transition-all"
                                    placeholder="Zip Code"
                                    maxLength={4}
                                    value={address.zip}
                                    onChange={e => setAddress({...address, zip: e.target.value})}
                                />
                                <input
                                    className="flex-1 bg-black/40 border border-white/10 p-4 rounded-xl text-white focus:border-[#800020] outline-none transition-all"
                                    placeholder="City"
                                    value={address.city}
                                    onChange={e => setAddress({...address, city: e.target.value})}
                                />
                            </div>

                            <Button
                                onClick={handlePreparePayment}
                                className="w-full bg-white hover:bg-zinc-200 text-black py-8 rounded-2xl text-lg font-bold uppercase tracking-widest mt-4"
                            >
                                Continue to Payment
                            </Button>
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-[2rem] shadow-2xl">
                            <Elements stripe={stripePromise} options={{ clientSecret }}>
                                <StripePayment orderId={orderId} />
                            </Elements>
                        </div>
                    )}
                </div>

                {/* RIGHT SIDE: Order Summary */}
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
                            <p className="text-[#800020] font-black text-2xl mt-1">{product.price} DKK</p>
                        </div>
                    </div>

                    <div className="space-y-3 py-6 border-y border-white/5 mb-6">
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-400">Subtotal</span>
                            <span className="font-bold">{product.price} DKK</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-green-500 uppercase tracking-tighter">
                            <span>Shipping</span>
                            <span>Insured & Tracked</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-lg font-bold">Total Amount</span>
                        <span className="text-3xl font-black">{product.price} DKK</span>
                    </div>

                    <p className="text-[10px] text-zinc-500 mt-8 leading-relaxed italic">
                        By proceeding, you agree to the escrow terms. Your money is only released to the seller once you've confirmed receipt of the item.
                    </p>
                </div>
            </div>
        </div>
    );
}