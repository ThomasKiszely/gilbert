"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import StripePayment from "./StripePayment";
import { Button } from "@/app/components/UI/button";
import { useAuth } from "@/app/context/AuthContext";
import { Loader2 } from "lucide-react";

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
    const [shippingMethod, setShippingMethod] = useState("dao");
    const [discountCode, setDiscountCode] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState(false);
    const [amounts, setAmounts] = useState({ productPrice: 0, shipping: 0, discount: 0, authenticationFee: 0, total: 0 });
    const [isLargeItem, setIsLargeItem] = useState(false);
    const [address, setAddress] = useState({ name: "", street: "", houseNumber: "", city: "", zip: "", country: "Denmark" });

    const SHIPPING_LABELS: Record<string, string> = {
        dao: "DAO – Indlevering",
        gls: "GLS – Pakkeshop (indlevering)",
        postnord: "PostNord – MyPack Collect (indlevering)",
        manual: "Manual pickup"
    };

    useEffect(() => {
        const fetchProduct = async () => {
            const res = await fetch(`/api/products/${productId}`, { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                const prod = data.product || data;
                setProduct(prod);
                setIsLargeItem(prod.isLargeItem === true);
                setAmounts(prev => ({ ...prev, productPrice: prod.price, total: prod.price }));
            }
            setLoading(false);
        };
        fetchProduct();
    }, [productId]);

    const calculateTotal = useCallback(async (forcedCode?: string | null) => {
        if (!isLargeItem && (!address.zip || address.zip.length < 4)) return;
        setIsCalculating(true);
        try {
            const res = await fetch(`/api/checkout/calculate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ productId, address, shippingMethod: isLargeItem ? "manual" : shippingMethod, discountCode: forcedCode ?? (appliedDiscount ? discountCode : null) })
            });
            const data = await res.json();
            if (data.success) setAmounts(data);
        } catch (err) { console.error(err); } finally { setIsCalculating(false); }
    }, [address, productId, shippingMethod, appliedDiscount, discountCode, isLargeItem]);

    useEffect(() => {
        const timer = setTimeout(() => calculateTotal(), 600);
        return () => clearTimeout(timer);
    }, [address.zip, address.city, shippingMethod, calculateTotal]);

    const handleDiscount = async () => {
        if (!appliedDiscount) {
            await calculateTotal(discountCode);
            setAppliedDiscount(true);
        } else {
            setAppliedDiscount(false);
            setDiscountCode("");
            calculateTotal(null);
        }
    };

    const handlePreparePayment = async () => {
        setIsPreparing(true);
        const res = await fetch(`/api/orders/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, address, shippingMethod, discountCode: appliedDiscount ? discountCode : null })
        });
        const data = await res.json();
        if (res.ok) { setClientSecret(data.clientSecret); setOrderId(data.order._id); }
        setIsPreparing(false);
    };

    if (loading) return <div className="min-h-screen bg-[#003d2b] flex items-center justify-center text-white">LOADING...</div>;

    const inputClass = "bg-[#16302b] border border-white/20 p-5 rounded-2xl text-white placeholder:text-white/40 focus:border-white/50 transition-all font-bold";

    return (
        <div className="min-h-screen bg-[#003d2b] pb-32 pt-24">
            <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-7 space-y-10">
                    <h2 className="text-5xl font-black uppercase italic text-white tracking-tighter">Checkout</h2>
                    {!clientSecret ? (
                        <div className="space-y-6">
                            <div className="bg-black/20 p-8 rounded-[2.5rem] border border-white/10 space-y-4">
                                <input className={`${inputClass} w-full`} placeholder="Full Name" value={address.name} onChange={e => setAddress({...address, name: e.target.value})} />
                                <div className="flex gap-4">
                                    <input className={`${inputClass} flex-[3]`} placeholder="Street" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} />
                                    <input className={`${inputClass} w-20 text-center`} placeholder="No." value={address.houseNumber} onChange={e => setAddress({...address, houseNumber: e.target.value})} />
                                </div>
                                <div className="flex gap-4">
                                    <input className={`${inputClass} w-24`} placeholder="Zip" maxLength={4} value={address.zip} onChange={e => setAddress({...address, zip: e.target.value})} />
                                    <input className={`${inputClass} flex-[3]`} placeholder="City" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} />
                                </div>
                            </div>
                            <div className="bg-black/20 p-8 rounded-[2.5rem] border border-white/10 space-y-4">
                                <div className="flex gap-2">
                                    <input className={`${inputClass} flex-1`} placeholder="Discount Code" value={discountCode} onChange={e => setDiscountCode(e.target.value)} />
                                    <Button onClick={handleDiscount} className="bg-white/10 hover:bg-white hover:text-black py-7 px-8 rounded-2xl font-black uppercase text-[10px]">
                                        {appliedDiscount ? "Remove" : "Apply"}
                                    </Button>
                                </div>
                                <select value={shippingMethod} onChange={(e) => setShippingMethod(e.target.value)} className={`${inputClass} w-full`}>
                                    <option value="dao" className="bg-[#16302b]">DAO – Indlevering</option>
                                    <option value="gls" className="bg-[#16302b]">GLS – Pakkeshop (indlevering)</option>
                                    <option value="postnord" className="bg-[#16302b]">PostNord – MyPack Collect (indlevering)</option>
                                </select>
                            </div>
                            <Button onClick={handlePreparePayment} className="w-full bg-white text-black py-8 rounded-[2rem] font-black uppercase tracking-[0.2em]">
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
                    <div className="bg-[#16302b] rounded-[3rem] p-10 border border-white/10 sticky top-24 text-white">
                        <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-white/50 mb-10">Order Summary</h3>
                        <div className="space-y-5 py-8 border-y border-white/10 mb-8 font-black uppercase text-xs">
                            <div className="flex justify-between text-white/50"><span>Product:</span><span>{amounts.productPrice} DKK</span></div>
                            <div className="flex justify-between text-white/50"><span>Shipping Method:</span><span>{SHIPPING_LABELS[shippingMethod]}</span></div>
                            <div className="flex justify-between text-white/50">
                                <span>Shipping:</span>
                                {isCalculating ? <Loader2 className="animate-spin w-4 h-4" /> : <span>{amounts.shipping} DKK</span>}
                            </div>
                            {appliedDiscount && <div className="flex justify-between text-green-400"><span>Discount:</span><span>-{amounts.discount} DKK</span></div>}
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-white/50 text-xs font-black uppercase tracking-widest">Total</span>
                            <span className="text-5xl font-black tracking-tighter italic">{amounts.total} DKK</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}