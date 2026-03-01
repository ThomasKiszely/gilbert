"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    MessageCircle, ArrowLeft, X, Heart, Share2,
    ChevronRight
} from "lucide-react";

import { Button } from "@/app/components/UI/button";
import { useAuth } from "@/app/context/AuthContext";
import ChatView from "@/app/components/chat/ChatView";
import { PlaceBid } from "@/app/components/Bids/PlaceBid";
import { toggleFavorite } from "@/app/api/favorites";
import ProductCard from "@/app/components/product/ProductCard";
import { cn } from "@/app/lib/utils";

// --- Hjælpefunktioner ---
const formatPrice = (price: number) => price?.toLocaleString("da-DK") + " kr.";

const ProductDetailsPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();

    // 1. Grupperet State (Undgår 5-6 re-renders ved data fetch)
    const [state, setState] = useState({
        product: null as any,
        similarProducts: [] as any[],
        loading: true,
        isFavorite: false,
    });

    const [selectedImage, setSelectedImage] = useState(0);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // 2. Optimeret Data Fetching
    const fetchAllData = useCallback(async () => {
        try {
            // Hent produkt og favoritter samtidigt (Parallel)
            const [productRes, favRes] = await Promise.allSettled([
                fetch(`/api/products/${id}`, { credentials: "include" }),
                fetch("/api/favorites", { credentials: "include" }),
            ]);

            let favoriteIds = new Set<string>();
            if (favRes.status === "fulfilled" && favRes.value.ok) {
                const favData = await favRes.value.json();
                if (favData.success) {
                    favoriteIds = new Set((favData.favorites || []).map((f: any) => String(f._id)));
                }
            }

            if (productRes.status === "fulfilled" && productRes.value.ok) {
                const data = await productRes.value.json();
                const p = data.product || data;

                // Opdater hovedprodukt med det samme
                setState(prev => ({
                    ...prev,
                    product: p,
                    isFavorite: favoriteIds.has(String(p._id)),
                    loading: false
                }));

                // Hent lignende produkter (uden at blokere for hovedproduktet)
                fetchSimilar(p, favoriteIds);
            } else {
                setState(prev => ({ ...prev, loading: false }));
            }
        } catch (err) {
            console.error("Error:", err);
            setState(prev => ({ ...prev, loading: false }));
        }
    }, [id]);

    const fetchSimilar = async (p: any, favoriteIds: Set<string>) => {
        const params = new URLSearchParams();
        if (p.brand?._id) params.set("brands", p.brand._id);
        if (p.subcategory?._id) params.set("subcategory", p.subcategory._id);
        params.set("limit", "5");

        try {
            const res = await fetch(`/api/products/filter?${params.toString()}`, { credentials: "include" });
            if (res.ok) {
                const simData = await res.json();
                const products = (simData.products || simData.data || [])
                    .filter((sp: any) => sp._id !== p._id)
                    .slice(0, 4)
                    .map((sp: any) => ({
                        ...sp,
                        isFavorite: favoriteIds.has(String(sp._id)),
                    }));
                setState(prev => ({ ...prev, similarProducts: products }));
            }
        } catch (e) { /* silent fail */ }
    };

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    // 3. Memoized beregninger (Kører kun når produktet ændrer sig)
    const meta = useMemo(() => {
        if (!state.product) return null;
        const p = state.product;
        return {
            discount: p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : null,
            brandName: p.brand?.name ?? p.brand ?? "",
            details: [
                { label: "Size", value: p.size?.label ?? p.size?.name ?? p.size },
                { label: "Condition", value: p.condition?.name ?? p.condition },
                { label: "Colour", value: p.color?.name ?? p.color },
                { label: "Material", value: p.material?.name ?? p.material },
            ].filter(d => d.value)
        };
    }, [state.product]);

    // 4. Handlers
    const handleToggleFavorite = async () => {
        if (!user) return router.push("/login");
        const success = await toggleFavorite(String(state.product._id));
        if (success !== undefined) {
            setState(prev => ({ ...prev, isFavorite: !prev.isFavorite }));
        }
    };

    if (state.loading) return (
        <div className="flex items-center justify-center min-h-[60vh] text-xs uppercase tracking-widest animate-pulse">
            Loading product...
        </div>
    );

    if (!state.product) return <div className="p-20 text-center">Product not found.</div>;

    const { product, isFavorite, similarProducts } = state;

    return (
        <div className="max-w-6xl mx-auto px-4 pb-16 min-h-screen">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-muted-foreground py-4 mb-2">
                <button onClick={() => router.back()} className="flex items-center gap-1 hover:text-foreground transition-colors">
                    <ArrowLeft className="h-3 w-3" /> Back
                </button>
                <ChevronRight className="h-3 w-3" />
                {product.subcategory?.name && (
                    <Link href={`/products/filter?subcategory=${product.subcategory._id}`} className="hover:text-foreground">
                        {product.subcategory.name}
                    </Link>
                )}
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Image Section - Optimeret med Next/Image */}
                <div className="space-y-4">
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-muted border border-border/30">
                        <Image
                            src={product.images?.[selectedImage] || "/images/ImagePlaceholder.jpg"}
                            alt={product.title}
                            fill
                            priority // LCP Optimering
                            className="object-cover"
                            sizes="(max-w-768px) 100vw, 50vw"
                        />
                    </div>
                    {product.images?.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {product.images.map((img: string, i: number) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedImage(i)}
                                    className={cn(
                                        "relative w-20 h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                                        selectedImage === i ? "border-foreground" : "border-transparent opacity-60"
                                    )}
                                >
                                    <Image src={img} alt={`Image ${i + 1}`} fill className="object-cover" sizes="80px" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
                    <div>
                        <Link href={`/products/filter?brands=${product.brand?._id}`} className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors">
                            {meta?.brandName}
                        </Link>
                        <h1 className="text-3xl font-serif mt-2 leading-tight">{product.title}</h1>
                    </div>

                    <div className="flex items-baseline gap-3">
                        <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
                        {product.originalPrice && (
                            <span className="text-muted-foreground line-through text-sm">{formatPrice(product.originalPrice)}</span>
                        )}
                        {meta?.discount && <span className="text-accent font-bold text-sm">-{meta.discount}%</span>}
                    </div>

                    {/* Specifikationer Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {meta?.details.map((d) => (
                            <div key={d.label} className="bg-muted/30 border border-border/20 rounded-xl p-3">
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-0.5">{d.label}</span>
                                <span className="text-sm font-medium">{d.value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Købsknapper */}
                    <div className="space-y-3 pt-4">
                        <div className="flex gap-2">
                            <Button onClick={() => user ? router.push(`/checkout/${product._id}`) : router.push("/login")} className="flex-1 h-14 rounded-2xl text-base font-bold shadow-lg shadow-foreground/5">
                                Buy now
                            </Button>
                            <Button variant="outline" onClick={handleToggleFavorite} className="h-14 w-14 rounded-2xl">
                                <Heart className={cn("h-5 w-5 transition-all", isFavorite && "fill-accent text-accent border-accent")} />
                            </Button>
                            <Button variant="outline" onClick={() => navigator.share?.({ title: product.title, url: window.location.href })} className="h-14 w-14 rounded-2xl">
                                <Share2 className="h-5 w-5" />
                            </Button>
                        </div>

                        <PlaceBid
                            productId={String(product._id)}
                            productPrice={product.price}
                            onBidPlaced={() => setTimeout(() => setIsChatOpen(true), 1500)}
                        />

                        <button onClick={() => user ? setIsChatOpen(true) : router.push("/login")} className="w-full text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground py-2 transition-colors flex items-center justify-center gap-2">
                            <MessageCircle className="h-4 h-4" /> Questions for the seller?
                        </button>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-border/30">
                        <div className="flex items-center gap-4">
                            <div className="relative h-12 w-12 rounded-full overflow-hidden border border-border/50">
                                <Image src={product.seller?.avatar || "/images/ImagePlaceholder.jpg"} alt="" fill className="object-cover" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold">{product.seller?.username || "Anonymous seller"}</p>
                                <p className="text-xs text-muted-foreground">⭐ {product.seller?.rating ?? 0} · {product.seller?.sales ?? 0} sales</p>
                            </div>
                            <Link href={`/profile/${product.seller?._id}`}>
                                <Button variant="secondary" size="sm" className="rounded-full text-[11px] font-bold px-4">View profile</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Similar Products */}
            {similarProducts.length > 0 && (
                <section className="mt-20 pt-12 border-t border-border/30">
                    <h2 className="text-2xl font-serif mb-8">Similar items</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {similarProducts.map((p) => (
                            <ProductCard
                                key={p._id}
                                product={{
                                    id: p._id,
                                    title: p.title,
                                    brand: p.brand?.name ?? "",
                                    price: p.price,
                                    imageUrl: p.images?.[0] ?? "",
                                    isFavorite: p.isFavorite,
                                }}
                                onToggleFavorite={async (pid) => {
                                    const ok = await toggleFavorite(pid);
                                    if (ok) setState(prev => ({
                                        ...prev,
                                        similarProducts: prev.similarProducts.map(sp => sp._id === pid ? { ...sp, isFavorite: !sp.isFavorite } : sp)
                                    }));
                                }}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Chat Modal */}
            {isChatOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsChatOpen(false)} />
                    <div className="relative bg-background w-full max-w-2xl h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-border/30">
                        <div className="p-5 border-b flex justify-between items-center bg-muted/20">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-foreground flex items-center justify-center">
                                    <MessageCircle className="h-5 w-5 text-background" />
                                </div>
                                <span className="font-serif font-bold">{product.title}</span>
                            </div>
                            <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors"><X /></button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <ChatView threadId={String(product._id)} isModal />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetailsPage;



