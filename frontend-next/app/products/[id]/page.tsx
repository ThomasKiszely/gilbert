"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/app/components/UI/button";
import { MessageCircle, ArrowLeft, X } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import ChatView from "@/app/components/chat/ChatView";
import { PlaceBid } from "@/app/components/Bids/PlaceBid";

const ProductDetailsPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isChatOpen, setIsChatOpen] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/${id}`);
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
    }, [id]);

    if (loading) return <div className="p-20 text-center text-zinc-500 font-mono uppercase tracking-widest text-xs">Loading product...</div>;
    if (!product) return <div className="p-20 text-center text-zinc-500">Product not found.</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 pt-24 min-h-screen">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-8 hover:text-white transition-colors font-bold"
            >
                <ArrowLeft className="h-3 w-3" /> Back
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* PRODUCT IMAGE */}
                <div className="aspect-[4/5] bg-[#16302b] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
                    {product.images?.[0] && (
                        <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>

                {/* PRODUCT INFO & ACTIONS */}
                <div className="flex flex-col gap-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{product.title}</h1>
                        <p className="text-2xl font-black text-[#800020]">{product.price} DKK</p>

                        <div className="h-px bg-white/10 my-6" />

                        {/* DESCRIPTION - Nu i en blødere Ivory/Zinc farve */}
                        <p className="text-sm text-zinc-400/80 leading-relaxed font-medium italic">
                            {product.description || "No description provided."}
                        </p>
                    </div>

                    {/* ACTION PANEL */}
                    <div className="mt-auto p-6 bg-white rounded-[2rem] shadow-xl flex flex-col gap-4">
                        <Button
                            onClick={() => !user && router.push("/login")}
                            className="w-full bg-black hover:bg-zinc-900 text-white py-8 rounded-2xl text-lg font-bold transition-all hover:scale-[1.01] active:scale-[0.98]"
                        >
                            Buy Now ({product.price} DKK)
                        </Button>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-zinc-100" />
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em]">
                                <span className="bg-white px-3 text-zinc-300 font-bold font-mono">Or</span>
                            </div>
                        </div>

                        {/* BIDDING SECTION */}
                        {user ? (
                            <PlaceBid
                                productId={String(product._id)}
                                productPrice={product.price}
                                onBidPlaced={() => {
                                    setTimeout(() => setIsChatOpen(true), 1500);
                                }}
                            />
                        ) : (
                            <Button
                                onClick={() => router.push("/login")}
                                variant="outline"
                                className="w-full py-8 rounded-2xl border-zinc-200 text-zinc-600 font-bold uppercase text-xs tracking-widest"
                            >
                                Login to Place Bid
                            </Button>
                        )}

                        <button
                            onClick={() => user ? setIsChatOpen(true) : router.push("/login")}
                            className="flex items-center justify-center gap-2 text-[10px] text-zinc-400 hover:text-[#800020] transition-colors uppercase tracking-[0.2em] font-black mt-2"
                        >
                            <MessageCircle className="h-3 w-3" />
                            Questions? Message Seller
                        </button>
                    </div>
                </div>
            </div>

            {/* CHAT MODAL */}
            {isChatOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
                    <div
                        className="absolute inset-0 bg-[#0a1f1a]/80 backdrop-blur-md animate-in fade-in duration-500"
                        onClick={() => setIsChatOpen(false)}
                    />

                    <div className="relative bg-[#0a1f1a] w-full max-w-2xl h-[85vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300 border border-white/10">
                        {/* MODAL HEADER */}
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#0a1f1a]">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-[#800020] flex items-center justify-center shadow-lg">
                                    <MessageCircle className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg leading-none">Negotiation</h3>
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-1 block">
                                        {product.title}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsChatOpen(false)}
                                className="p-3 hover:bg-white/5 rounded-full transition-colors group"
                            >
                                <X className="h-6 w-6 text-zinc-500 group-hover:text-white" />
                            </button>
                        </div>

                        {/* MODAL BODY (CHAT) */}
                        <div className="flex-1 overflow-hidden">
                            <ChatView
                                threadId={String(product._id)}
                                isModal={true}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetailsPage;