"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import StripePayment from "./StripePayment";
import { Button } from "@/app/components/UI/button";
import { useAuth } from "@/app/context/AuthContext";
import {
    X,
    ShieldAlert,
    Truck,
    ShieldCheck,
    Tag,
    ChevronDown,
    Info,
    CheckCircle2,
    Loader2
} from "lucide-react";

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
    const [isCalculating, setIsCalculating] = useState(false);

    // Form states
    const [shippingMethod, setShippingMethod] = useState("gls");
    const [discountCode, setDiscountCode] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState(false);

    // Calculation State
    const [amounts, setAmounts] = useState({
        productPrice: 0,
        shipping: 0,
        discount: 0,
        authenticationFee: 0,
        total: 0
    });

    const [stripeError, setStripeError] = useState<string | null>(null);
    const [address, setAddress] = useState({
        name: "",
        street: "",
        houseNumber: "",
        city: "",
        zip: "",
        country: "Denmark"
    });

    // 1. Fetch Product
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/${productId}`);
                if (res.ok) {
                    const data = await res.json();
                    const prod = data.product || data;
                    setProduct(prod);
                    setAmounts(prev => ({ ...prev, productPrice: prod.price, total: prod.price }));
                }
            } catch (err) {
                console.error("Error fetching product:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    // 2. Calculate Checkout Logic
    const calculateTotal = useCallback(async (forcedCode?: string | null) => {
        // Vi kræver zip/by for at beregne fragt korrekt
        if (!address.zip || !address.city || address.zip.length < 4) return;

        setIsCalculating(true);
        try {
            const res = await fetch(`/api/checkout/calculate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user?.token}`
                },
                body: JSON.stringify({
                    productId,
                    address,
                    shippingMethod,
                    // Hvis forcedCode er defineret (selv som null), bruger vi den, ellers tjekker vi appliedDiscount staten
                    discountCode: forcedCode !== undefined ? forcedCode : (appliedDiscount ? discountCode : null)
                })
            });

            const data = await res.json();
            if (data.success) {
                setAmounts({
                    productPrice: data.productPrice,
                    shipping: data.shipping,
                    discount: data.discount,
                    authenticationFee: data.authenticationFee,
                    total: data.total
                });
            }
        } catch (err) {
            console.error("Calculation failed:", err);
        } finally {
            setIsCalculating(false);
        }
    }, [address.zip, address.city, productId, user?.token, shippingMethod, appliedDiscount, discountCode]);

    // Re-calculate when shipping or address changes
    useEffect(() => {
        const timer = setTimeout(() => calculateTotal(), 600);
        return () => clearTimeout(timer);
    }, [address.zip, address.city, shippingMethod, calculateTotal]);

    // 3. Discount Logic
    const applyDiscount = async () => {
        if (!discountCode) return;

        setIsCalculating(true);
        try {
            const res = await fetch(`/api/checkout/calculate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user?.token}`
                },
                body: JSON.stringify({
                    productId,
                    address,
                    shippingMethod,
                    discountCode: discountCode
                })
            });

            const data = await res.json();

            if (data.success && data.discount > 0) {
                setAppliedDiscount(true);
                setAmounts({
                    productPrice: data.productPrice,
                    shipping: data.shipping,
                    discount: data.discount,
                    authenticationFee: data.authenticationFee,
                    total: data.total
                });
            } else {
                setAppliedDiscount(false);
                alert(data.reason || "Invalid or inactive discount code");
            }
        } catch (err) {
            alert("Error validating discount code");
        } finally {
            setIsCalculating(false);
        }
    };

    const removeDiscount = () => {
        setAppliedDiscount(false);
        setDiscountCode("");
        // Genberegn med null kode
        calculateTotal(null);
    };

    // 4. Handle Order Creation
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
                    shippingMethod,
                    discountCode: appliedDiscount ? discountCode : null,
                    bidId: null,
                    wantAuth: false
                })
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.requiresSellerStripeReconnect) {
                    setStripeError("The seller's Stripe account is inactive. They must reconnect their account.");
                } else {
                    alert(data.error || data.message || "Failed to initiate order");
                }
                return;
            }

            setClientSecret(data.clientSecret);
            setOrderId(data.order._id);

        } catch (err) {
            console.error("Payment preparation failed:", err);
        } finally {
            setIsPreparing(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#003d2b] flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-white animate-spin opacity-20" />
            <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/40">Securing Session...</div>
        </div>
    );

    if (!product) return <div className="min-h-screen bg-[#003d2b] flex items-center justify-center text-white font-black italic uppercase">Product not found</div>;

    return (
        <div className="min-h-screen bg-[#003d2b] pb-32">
            <div className="max-w-6xl mx-auto p-6 pt-24">

                {/* STRIPE ERROR MODAL */}
                {stripeError && (
                    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-6 text-white">
                        <div className="bg-[#16302b] border border-white/10 w-full max-w-lg rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
                            <button onClick={() => setStripeError(null)} className="absolute top-8 right-8 text-white/30 hover:text-white"><X size={24} /></button>
                            <div className="flex flex-col items-center text-center space-y-6">
                                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20"><ShieldAlert size={40} className="text-red-500" /></div>
                                <h3 className="text-2xl font-black italic">Action Required</h3>
                                <p className="text-white/60 text-sm leading-relaxed">{stripeError}</p>
                                <Button onClick={() => setStripeError(null)} className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest text-[10px]">Close</Button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* LEFT SIDE: INPUTS */}
                    <div className="lg:col-span-7 space-y-10">
                        <div>
                            <h2 className="text-5xl font-black uppercase italic tracking-tighter text-white leading-none">Checkout</h2>
                            <p className="text-white/40 text-[10px] font-mono uppercase tracking-[0.3em] mt-3">Shipment & Verification</p>
                        </div>

                        {!clientSecret ? (
                            <div className="space-y-6">
                                {/* SHIPPING FORM */}
                                <div className="bg-black/20 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-sm shadow-2xl space-y-4">
                                    <div className="flex items-center gap-3 mb-4 text-white/60">
                                        <Info size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Delivery Address</span>
                                    </div>
                                    <input className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:bg-white/10 transition-all font-bold placeholder:text-white/10" placeholder="Full Name" value={address.name} onChange={e => setAddress({...address, name: e.target.value})} />
                                    <div className="flex gap-4">
                                        <input className="flex-[3] bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:bg-white/10 transition-all font-bold placeholder:text-white/10" placeholder="Street Address" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} />
                                        <input className="flex-1 bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:bg-white/10 transition-all text-center font-mono placeholder:text-white/10" placeholder="No." value={address.houseNumber} onChange={e => setAddress({...address, houseNumber: e.target.value})} />
                                    </div>
                                    <div className="flex gap-4">
                                        <input className="w-1/3 bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:bg-white/10 transition-all font-mono placeholder:text-white/10" placeholder="Zip" maxLength={4} value={address.zip} onChange={e => setAddress({...address, zip: e.target.value})} />
                                        <input className="flex-1 bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:bg-white/10 transition-all font-bold placeholder:text-white/10" placeholder="City" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} />
                                    </div>
                                </div>

                                {/* SHIPPING METHOD DROPDOWN */}
                                <div className="bg-black/20 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-sm shadow-2xl">
                                    <div className="flex items-center gap-3 mb-6 text-white/60">
                                        <Truck size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Select Shipping Method</span>
                                    </div>
                                    <div className="relative group">
                                        <select
                                            value={shippingMethod}
                                            onChange={(e) => setShippingMethod(e.target.value)}
                                            className="w-full appearance-none bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none font-bold cursor-pointer hover:bg-white/10 transition-all"
                                        >
                                            <option value="gls" className="bg-[#16302b]">GLS - Home Delivery</option>
                                            <option value="dao" className="bg-[#16302b]">DAO - Home Delivery</option>
                                            <option value="bring" className="bg-[#16302b]">Bring - Service Point</option>
                                        </select>
                                        <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none group-hover:text-white" />
                                    </div>
                                </div>

                                <Button
                                    onClick={handlePreparePayment}
                                    disabled={isPreparing || isCalculating}
                                    className="w-full bg-white text-black py-8 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50"
                                >
                                    {isPreparing ? "Initializing..." : "Proceed to Payment"}
                                </Button>
                            </div>
                        ) : (
                            <div className="bg-white p-10 rounded-[3rem] shadow-2xl">
                                <Elements stripe={stripePromise} options={{ clientSecret }}>
                                    <StripePayment orderId={orderId} clientSecret={clientSecret} />
                                </Elements>
                            </div>
                        )}
                    </div>

                    {/* RIGHT SIDE: SUMMARY */}
                    <div className="lg:col-span-5">
                        <div className="bg-[#16302b] rounded-[3rem] p-10 border border-white/10 shadow-2xl sticky top-24 text-white">
                            <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-white/50 mb-10">Order Summary</h3>

                            <div className="flex gap-6 mb-10 items-start">
                                <div className="w-24 h-24 bg-black/40 rounded-[1.5rem] overflow-hidden border border-white/10 shrink-0">
                                    {product.images?.[0] && <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-xl leading-tight truncate uppercase tracking-tighter italic">{product.title}</p>
                                    <p className="text-white/60 text-[10px] mt-1 font-mono uppercase tracking-widest">
                                        {typeof product.category === 'object' ? product.category.name : (product.category || 'Item')}
                                    </p>
                                </div>
                            </div>

                            {/* DISCOUNT CODE BOX */}
                            <div className="mb-8 flex gap-2">
                                <div className="relative flex-1">
                                    <input
                                        className={`w-full bg-black/40 border ${appliedDiscount ? 'border-green-500/50' : 'border-white/5'} p-4 rounded-xl text-[10px] uppercase font-black tracking-widest text-white outline-none focus:border-white/20 transition-all placeholder:text-white/20`}
                                        placeholder={appliedDiscount ? "Code Applied!" : "Discount Code"}
                                        value={discountCode}
                                        disabled={appliedDiscount}
                                        onChange={(e) => setDiscountCode(e.target.value)}
                                    />
                                    {appliedDiscount && (
                                        <button
                                            onClick={removeDiscount}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-red-400 uppercase hover:text-red-300"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                                {!appliedDiscount && (
                                    <button
                                        onClick={applyDiscount}
                                        disabled={isCalculating || !discountCode}
                                        className="bg-white/10 hover:bg-white/20 px-6 rounded-xl transition-all flex items-center justify-center disabled:opacity-30"
                                    >
                                        {isCalculating ? (
                                            <Loader2 size={18} className="text-white animate-spin" />
                                        ) : (
                                            <CheckCircle2 size={18} className="text-white" />
                                        )}
                                    </button>
                                )}
                            </div>

                            <div className="space-y-5 py-8 border-y border-white/10 mb-8">
                                <div className="flex justify-between text-xs items-center">
                                    <span className="text-white/50 uppercase font-black tracking-widest">Price</span>
                                    <span className="font-bold text-base">{amounts.productPrice} DKK</span>
                                </div>
                                <div className="flex justify-between text-xs items-center">
                                    <div className="flex items-center gap-2">
                                        <Truck size={14} className="text-white/30" />
                                        <span className="text-white/50 uppercase font-black tracking-widest">Shipping ({shippingMethod.toUpperCase()})</span>
                                    </div>
                                    <span className={`font-bold text-base ${isCalculating ? "animate-pulse" : ""}`}>
                                        {amounts.shipping > 0 ? `${amounts.shipping} DKK` : "Calculating..."}
                                    </span>
                                </div>

                                {amounts.authenticationFee > 0 && (
                                    <div className="flex justify-between text-xs items-center text-amber-400">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck size={14} />
                                            <span className="uppercase font-black tracking-widest">Authentication Fee</span>
                                        </div>
                                        <span className="font-bold text-base">+{amounts.authenticationFee} DKK</span>
                                    </div>
                                )}

                                {amounts.discount > 0 && (
                                    <div className="flex justify-between text-xs items-center text-green-400 font-black">
                                        <div className="flex items-center gap-2">
                                            <Tag size={14} />
                                            <span className="uppercase tracking-widest">Discount Applied</span>
                                        </div>
                                        <span className="text-base">-{amounts.discount} DKK</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-end mb-10">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 block mb-1">Total Payment</span>
                                    <div className="h-1 w-8 bg-white/20 rounded-full" />
                                </div>
                                <span className="text-5xl font-black tracking-tighter italic leading-none">{amounts.total} DKK</span>
                            </div>

                            <div className="p-6 bg-black/30 rounded-[2rem] border border-white/5 backdrop-blur-sm">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 h-2 w-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                                    <p className="text-[10px] text-white/60 leading-relaxed uppercase tracking-widest font-medium">
                                        <span className="text-white font-black block mb-1">Escrow Protection Active</span>
                                        Payment is held securely and only released to the seller after your confirmation.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}