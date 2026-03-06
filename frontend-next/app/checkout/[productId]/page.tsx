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
    Loader2,
    PackageSearch
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

    const [shippingMethod, setShippingMethod] = useState("gls");
    const [discountCode, setDiscountCode] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState(false);

    const [amounts, setAmounts] = useState({
        productPrice: 0,
        shipping: 0,
        discount: 0,
        authenticationFee: 0,
        total: 0
    });

    const [isLargeItem, setIsLargeItem] = useState(false);
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
                const res = await fetch(`/api/products/${productId}`, { credentials: "include" });
                if (res.ok) {
                    const data = await res.json();
                    const prod = data.product || data;
                    setProduct(prod);
                    setIsLargeItem(prod.isLargeItem === true);
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

    const calculateTotal = useCallback(async (forcedCode?: string | null) => {
        if (!isLargeItem && (!address.zip || !address.city || address.zip.length < 4)) return;

        setIsCalculating(true);
        try {
            const res = await fetch(`/api/checkout/calculate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    productId,
                    address,
                    shippingMethod: isLargeItem ? "manual" : shippingMethod,
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
    }, [address.zip, address.city, productId, shippingMethod, appliedDiscount, discountCode, isLargeItem]);

    useEffect(() => {
        const timer = setTimeout(() => calculateTotal(), 600);
        return () => clearTimeout(timer);
    }, [address.zip, address.city, shippingMethod, calculateTotal]);

    const applyDiscount = async () => {
        if (!discountCode) return;
        setIsCalculating(true);
        try {
            const res = await fetch(`/api/checkout/calculate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    productId,
                    address,
                    shippingMethod: isLargeItem ? "manual" : shippingMethod,
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
        calculateTotal(null);
    };

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
            const res = await fetch(`/api/orders/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    productId,
                    address,
                    shippingMethod: isLargeItem ? "manual" : shippingMethod,
                    discountCode: appliedDiscount ? discountCode : null,
                    bidId: null,
                    wantAuth: false
                })
            });

            const data = await res.json();
            if (!res.ok) {
                if (data.requiresSellerStripeReconnect) {
                    setStripeError("The seller's Stripe account is inactive.");
                } else {
                    alert(data.error || data.message || "Failed to initiate order");
                }
                setIsPreparing(false);
                return;
            }

            setClientSecret(data.clientSecret);
            setOrderId(data.order._id);
        } catch (err) {
            console.error("Payment preparation failed:", err);
            alert("Could not connect to the server.");
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
                    <div className="lg:col-span-7 space-y-10">
                        <div>
                            <h2 className="text-5xl font-black uppercase italic tracking-tighter text-white leading-none">Checkout</h2>
                            <p className="text-white/40 text-[10px] font-mono uppercase tracking-[0.3em] mt-3">
                                {isLargeItem ? "Manual Pickup Arrangement" : "Shipment & Verification"}
                            </p>
                        </div>
                        {!clientSecret ? (
                            <div className="space-y-6">
                                <div className="bg-black/20 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-sm shadow-2xl space-y-4">
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
                                <div className="bg-black/20 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-sm shadow-2xl">
                                    <div className="flex items-center gap-3 mb-6 text-white/60">
                                        <Truck size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{isLargeItem ? "Pickup Arrangement" : "Select Shipping Method"}</span>
                                    </div>
                                    {isLargeItem ? (
                                        <div className="flex items-start gap-4 p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                                            <PackageSearch className="text-amber-500 shrink-0" size={24} />
                                            <p className="text-[10px] text-white/60 leading-relaxed uppercase font-medium">This item is too large for standard shipping. You and the seller must arrange pickup manually.</p>
                                        </div>
                                    ) : (
                                        <select value={shippingMethod} onChange={(e) => setShippingMethod(e.target.value)} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none font-bold cursor-pointer hover:bg-white/10 transition-all">
                                            <option value="gls" className="bg-[#16302b]">GLS - Home Delivery</option>
                                            <option value="dao" className="bg-[#16302b]">DAO - Home Delivery</option>
                                            <option value="bring" className="bg-[#16302b]">Bring - Service Point</option>
                                        </select>
                                    )}
                                </div>
                                <Button onClick={handlePreparePayment} disabled={isPreparing || isCalculating} className="w-full bg-white text-black py-8 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50">
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
                    <div className="lg:col-span-5">
                        <div className="bg-[#16302b] rounded-[3rem] p-10 border border-white/10 shadow-2xl sticky top-24 text-white">
                            <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-white/50 mb-10">Order Summary</h3>
                            <div className="space-y-5 py-8 border-y border-white/10 mb-8">
                                <div className="flex justify-between text-xs items-center">
                                    <span className="text-white/50 uppercase font-black tracking-widest">Total Payment</span>
                                    <span className="text-5xl font-black tracking-tighter italic leading-none">{amounts.total} DKK</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}