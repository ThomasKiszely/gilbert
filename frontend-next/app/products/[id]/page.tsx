"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/app/components/UI/button";
import {
    MessageCircle, ArrowLeft, X, Heart, Share2, Shield, ChevronRight, Truck, RotateCcw
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import ChatView from "@/app/components/chat/ChatView";
import { PlaceBid } from "@/app/components/Bids/PlaceBid";
import { toggleFavorite } from "@/app/api/favorites";
import ProductCard from "@/app/components/product/ProductCard";
import { cn } from "@/app/lib/utils";

const ProductDetailsPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);
    const [similarProducts, setSimilarProducts] = useState<any[]>([]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/${id}`, { credentials: "include" });
                if (res.ok) {
                    const data = await res.json();
                    const p = data.product || data;
                    setProduct(p);
                    setIsFavorite(p.isFavorite ?? false);

                    // Fetch similar products by same subcategory/brand
                    const params = new URLSearchParams();
                    if (p.brand?._id) params.set("brands", p.brand._id);
                    if (p.subcategory?._id) params.set("subcategory", p.subcategory._id);
                    params.set("limit", "4");

                    const simRes = await fetch(`/api/products/filter?${params.toString()}`, { credentials: "include" });
                    if (simRes.ok) {
                        const simData = await simRes.json();
                        const products = (simData.products || simData.data || []).filter((sp: any) => sp._id !== p._id).slice(0, 4);
                        setSimilarProducts(products);
                    }
                }
            } catch (err) {
                console.error("Error fetching product:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    async function handleToggleFavorite() {
        if (!user) { router.push("/login"); return; }
        const ok = await toggleFavorite(String(product._id));
        if (ok !== undefined) setIsFavorite(prev => !prev);
    }

    function handleBuyNow() {
        if (!user) { router.push("/login"); return; }
        router.push(`/checkout/${product._id}`);
    }

    function handleShare() {
        if (navigator.share) {
            navigator.share({ title: product.title, url: window.location.href });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    }

    if (loading) return (
        <div className="p-20 text-center text-muted-foreground font-mono uppercase tracking-widest text-xs">
            Loading product...
        </div>
    );
    if (!product) return (
        <div className="p-20 text-center text-muted-foreground">Product not found.</div>
    );

    const images: string[] = product.images?.length ? product.images : [];
    const brandName: string = product.brand?.name ?? product.brand ?? "";
    const discount = product.originalPrice
        ? Math.round((1 - product.price / product.originalPrice) * 100)
        : null;

    const quickDetails = [
        { label: "Size", value: product.size?.label ?? product.size?.name ?? (typeof product.size === "string" ? product.size : null) },
        { label: "Condition", value: product.condition?.name ?? (typeof product.condition === "string" ? product.condition : null) },
        { label: "Colour", value: product.color?.name ?? (typeof product.color === "string" ? product.color : null) },
        { label: "Material", value: product.material?.name ?? (typeof product.material === "string" ? product.material : null) },
    ].filter(d => d.value);

    return (
        <div className="max-w-6xl mx-auto px-4 pb-16 min-h-screen">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-muted-foreground py-4 mb-2">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-3 w-3" /> Back
                </button>
                <ChevronRight className="h-3 w-3" />
                {product.subcategory?.name && (
                    <>
                        <Link
                            href={`/products/filter?subcategory=${product.subcategory._id}`}
                            className="hover:text-foreground transition-colors"
                        >
                            {product.subcategory.name}
                        </Link>
                        <ChevronRight className="h-3 w-3" />
                    </>
                )}
                <span className="text-foreground truncate max-w-[200px]">{product.title}</span>
            </nav>

            {/* Product Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Images */}
                <div className="space-y-3">
                    <div className="aspect-[3/4] rounded-xl overflow-hidden bg-card border border-border/30">
                        {images[selectedImage] ? (
                            <img
                                src={images[selectedImage]}
                                alt={product.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                                No image available
                            </div>
                        )}
                    </div>
                    {images.length > 1 && (
                        <div className="flex gap-3 flex-wrap">
                            {images.map((img: string, i: number) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedImage(i)}
                                    className={cn(
                                        "w-20 h-24 rounded-lg overflow-hidden border-2 transition-all",
                                        selectedImage === i
                                            ? "border-foreground"
                                            : "border-border/30 opacity-60 hover:opacity-100"
                                    )}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="lg:sticky lg:top-36 lg:self-start space-y-6">
                    {/* Brand & Title */}
                    <div>
                        {brandName && (
                            <Link
                                href={`/products/filter?brands=${product.brand?._id ?? ""}`}
                                className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {brandName}
                            </Link>
                        )}
                        <h1 className="text-3xl md:text-4xl font-serif text-foreground mt-1">
                            {product.title}
                        </h1>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-3">
                        <span className="text-2xl font-bold text-foreground">
                            {product.price?.toLocaleString("en-GB")} kr.
                        </span>
                        {product.originalPrice && (
                            <>
                                <span className="text-base text-muted-foreground line-through">
                                    {product.originalPrice.toLocaleString("en-GB")} kr.
                                </span>
                                <span className="text-sm font-semibold text-accent">
                                    -{discount}%
                                </span>
                            </>
                        )}
                    </div>

                    {/* Quick Details */}
                    {quickDetails.length > 0 && (
                        <div className="grid grid-cols-2 gap-3">
                            {quickDetails.map((detail) => (
                                <div
                                    key={detail.label}
                                    className="bg-card border border-border/30 rounded-lg px-4 py-3"
                                >
                                    <span className="text-xs text-muted-foreground block">{detail.label}</span>
                                    <span className="text-sm font-medium text-foreground">{detail.value}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-3">
                        <div className="flex gap-3">
                            <Button
                                onClick={handleBuyNow}
                                className="flex-1 h-12 text-base font-semibold rounded-xl"
                            >
                                Buy now — {product.price?.toLocaleString("en-GB")} kr.
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-12 w-12 rounded-xl"
                                onClick={handleToggleFavorite}
                                aria-label={isFavorite ? "Remove from favourites" : "Add to favourites"}
                            >
                                <Heart className={cn("h-5 w-5 transition-colors", isFavorite && "fill-accent text-accent")} />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-12 w-12 rounded-xl"
                                onClick={handleShare}
                                aria-label="Share product"
                            >
                                <Share2 className="h-5 w-5" />
                            </Button>
                        </div>

                        {user ? (
                            <PlaceBid
                                productId={String(product._id)}
                                productPrice={product.price}
                                onBidPlaced={() => setTimeout(() => setIsChatOpen(true), 1500)}
                            />
                        ) : (
                            <Button
                                variant="secondary"
                                className="w-full h-12 rounded-xl text-base"
                                onClick={() => router.push("/login")}
                            >
                                <MessageCircle className="h-5 w-5 mr-2" />
                                Log in to place a bid
                            </Button>
                        )}

                        <button
                            onClick={() => user ? setIsChatOpen(true) : router.push("/login")}
                            className="flex items-center justify-center gap-2 w-full text-xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest font-semibold pt-1"
                        >
                            <MessageCircle className="h-4 w-4" />
                            Questions? Contact the seller
                        </button>
                    </div>

                    <div className="h-px bg-border/30" />

                    {/* Trust Signals */}
                    <div className="space-y-3">
                        {[
                            { icon: Shield, text: "Authenticated by Gilbert" },
                            { icon: Truck, text: "Free shipping over 1,000 kr." },
                            { icon: RotateCcw, text: "14-day return policy" },
                        ].map(({ icon: Icon, text }) => (
                            <div key={text} className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Icon className="h-4 w-4 text-foreground/50 shrink-0" />
                                <span>{text}</span>
                            </div>
                        ))}
                    </div>

                    <div className="h-px bg-border/30" />

                    {/* Seller */}
                    {product.seller && (
                        <div className="flex items-center gap-4">
                            <img
                                src={product.seller.avatar ?? "/images/ImagePlaceholder.jpg"}
                                alt={product.seller.username ?? product.seller.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-border/30"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground text-sm truncate">
                                    {product.seller.username ?? product.seller.name}
                                </p>
                                {product.seller.rating != null && (
                                    <p className="text-xs text-muted-foreground">
                                        ⭐ {product.seller.rating} · {product.seller.sales ?? 0} sales
                                    </p>
                                )}
                            </div>
                            <Link href={`/profile/${product.seller._id ?? product.seller.id}`}>
                                <Button variant="secondary" size="sm" className="rounded-full text-xs shrink-0">
                                    View profile
                                </Button>
                            </Link>
                        </div>
                    )}

                    <div className="h-px bg-border/30" />

                    {/* Description */}
                    {product.description && (
                        <div>
                            <h3 className="text-lg font-serif text-foreground mb-2">Description</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {product.description}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Similar Products */}
            {similarProducts.length > 0 && (
                <section className="py-12 md:py-16">
                    <h2 className="text-2xl md:text-3xl font-serif text-foreground mb-8">
                        Similar products
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                                    tag: p.tags?.[0]?.name,
                                }}
                                onToggleFavorite={(pid) => toggleFavorite(pid)}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Chat Modal */}
            {isChatOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsChatOpen(false)}
                    />
                    <div className="relative bg-card w-full max-w-2xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-border/30">
                        <div className="p-6 border-b border-border/30 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center">
                                    <MessageCircle className="h-5 w-5 text-foreground" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground text-base font-serif leading-none">
                                        Negotiation
                                    </h3>
                                    <span className="text-xs text-muted-foreground mt-0.5 block truncate max-w-[200px]">
                                        {product.title}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsChatOpen(false)}
                                className="p-2 hover:bg-muted rounded-full transition-colors"
                            >
                                <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <ChatView threadId={String(product._id)} isModal={true} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetailsPage;
