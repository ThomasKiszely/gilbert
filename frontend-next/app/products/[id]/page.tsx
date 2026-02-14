"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/app/components/UI/button";
import { MessageCircle, ArrowLeft, X } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
// VIGTIGT: Importér ChatView i stedet for ChatPage
import ChatView from "@/app/components/chat/ChatView";

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
                console.error("Fejl:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    if (loading) return <div className="p-20 text-center text-zinc-500">Henter produkt...</div>;
    if (!product) return <div className="p-20 text-center">Produktet findes ikke.</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 pt-24 min-h-screen">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-muted-foreground mb-6 hover:text-black transition-colors">
                <ArrowLeft className="h-4 w-4" /> Tilbage
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="aspect-square bg-white border border-zinc-100 rounded-3xl overflow-hidden shadow-sm">
                    {product.images?.[0] && (
                        <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                    )}
                </div>

                <div className="flex flex-col gap-4">
                    <h1 className="text-4xl font-bold tracking-tight text-black">{product.title}</h1>
                    <p className="text-2xl font-medium text-[#800020]">{product.price} kr.</p>
                    <div className="h-px bg-zinc-100 my-2" />
                    <p className="text-base text-zinc-600 leading-relaxed italic">
                        {product.description || "Ingen beskrivelse."}
                    </p>

                    <div className="mt-auto p-6 bg-zinc-50 rounded-3xl border border-zinc-100">
                        <Button
                            onClick={() => user ? setIsChatOpen(true) : router.push("/login")}
                            className="w-full gap-2 bg-[#800020] hover:bg-[#600018] text-white py-7 rounded-2xl text-lg font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <MessageCircle className="h-5 w-5" />
                            Kontakt sælger
                        </Button>
                    </div>
                </div>
            </div>

            {/* CHAT MODAL */}
            {isChatOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={() => setIsChatOpen(false)}
                    />

                    <div className="relative bg-white w-full max-w-2xl h-[80vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300 border border-white/20">
                        <div className="p-6 border-b flex justify-between items-center bg-white">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-[#800020]/5 flex items-center justify-center">
                                    <MessageCircle className="h-5 w-5 text-[#800020]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-black leading-none">Kontakt Sælger</h3>
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{product.title}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsChatOpen(false)}
                                className="p-2 hover:bg-zinc-100 rounded-full transition-colors group"
                            >
                                <X className="h-6 w-6 text-zinc-400 group-hover:text-black" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden">
                            {/* Her bruger vi den nye ChatView komponent uden WebStorm brok */}
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