'use client';

import { useEffect, useState, useCallback } from "react";
import BlogPost from "@/app/components/home/BlogPost";
import FeaturedProducts from "@/app/components/home/FeaturedProducts";
import CategoryList from "@/app/components/home/CategoryList";
import type { ApiProduct, Product } from "@/app/components/product/types";
import { api } from "@/app/api/api";
import { toggleFavorite } from "@/app/api/favorites";
import {Button} from "@/app/components/UI/button";
import Link from "next/link";

function mapProducts(items: ApiProduct[], favoriteIds: Set<string>): Product[] {
    return items.map((p) => ({
        id: p._id,
        title: p.title,
        brand: p.brand?.name || "",
        price: p.price,
        imageUrl: p.images?.[0] || "/images/ImagePlaceholder.jpg",
        tag: p.tags?.[0]?.name,
        isFavorite: favoriteIds.has(String(p._id)),
    }));
}

const Index = () => {
    const [newArrivals, setNewArrivals] = useState<Product[]>([]);
    const [trending, setTrending] = useState<Product[]>([]);
    const [editorsPicks, setEditorsPicks] = useState<Product[]>([]);
    const [frontPost, setFrontPost] = useState<any>(null);

    const loadData = useCallback(async (signal?: AbortSignal) => {
        try {
            const [productsRes, trendingRes, editorsRes, favRes, blogRes] = await Promise.allSettled([
                api("/api/products?limit=15", { signal }),
                api("/api/products/trending?limit=15", { signal }),
                api("/api/products/editors-picks?limit=15", { signal }),
                api("/api/favorites", { signal }),
                api("/api/blogs/front", { signal }),
            ]);

            // Build favoriteIds set
            let favoriteIds = new Set<string>();
            if (favRes.status === "fulfilled" && favRes.value.ok) {
                try {
                    const favData = await favRes.value.json();
                    if (favData.success) {
                        favoriteIds = new Set(
                            (favData.favorites || []).map((f: any) => String(f._id))
                        );
                    }
                } catch {}
            }

            // New Arrivals (sorted by newest from backend)
            if (productsRes.status === "fulfilled" && productsRes.value.ok) {
                const data = await productsRes.value.json();
                setNewArrivals(mapProducts(data, favoriteIds));
            }

            // Trending (sorted by most favorited from backend)
            if (trendingRes.status === "fulfilled" && trendingRes.value.ok) {
                const data = await trendingRes.value.json();
                if (Array.isArray(data)) setTrending(mapProducts(data, favoriteIds));
            }

            // Editor's Picks (random selection from backend)
            if (editorsRes.status === "fulfilled" && editorsRes.value.ok) {
                const data = await editorsRes.value.json();
                if (Array.isArray(data)) setEditorsPicks(mapProducts(data, favoriteIds));
            }

            // Blog post
            if (blogRes.status === "fulfilled" && blogRes.value.ok) {
                try {
                    const blogData = await blogRes.value.json();
                    if (blogData.success && blogData.data?.post) {
                        const { post, teaser } = blogData.data;
                        const cleanTeaser = teaser || post.content?.replace(/<[^>]*>/g, '').substring(0, 150);
                        setFrontPost({ ...post, displayTeaser: cleanTeaser });
                    }
                } catch {}
            }
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error("Error loading data:", err);
            }
        }
    }, []);

    // A single handler that updates all sections (since a product can appear in multiple)
    const handleToggleFavorite = useCallback(async (productId: string) => {
        // Optimistic update across all sections
        const toggle = (prev: Product[]) =>
            prev.map(p => p.id === productId ? { ...p, isFavorite: !p.isFavorite } : p);

        setNewArrivals(toggle);
        setTrending(toggle);
        setEditorsPicks(toggle);

        const success = await toggleFavorite(productId);

        if (!success) {
            setNewArrivals(toggle);
            setTrending(toggle);
            setEditorsPicks(toggle);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        loadData(controller.signal);
        return () => controller.abort();
    }, [loadData]);

    // Fallback: if trending/editors-picks endpoints returned nothing, derive from newArrivals
    const displayEditorsPicks = editorsPicks.length > 0 ? editorsPicks : newArrivals.slice(0, 5);
    const displayTrending = trending.length > 0 ? trending : newArrivals.slice(2, 12);

    return (
        <div className="pb-16">
            {/* Hero blog banner – full width */}
            <BlogPost
                title={frontPost?.title || "Vintage Office Core"}
                subtitle={frontPost?.displayTeaser || "Shop vintage tailoring – hand-picked pieces for the modern professional."}
                imageUrl={frontPost?.image || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80"}
                slug={frontPost?.slug}
            />

            {/* Categories */}
            <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
                <CategoryList
                    categories={[
                        { id: "1", name: "Women", imageUrl: "", link: "/products/filter?gender=Female" },
                        { id: "2", name: "Men", imageUrl: "", link: "/products/filter?gender=Male" },
                        { id: "3", name: "Brands", imageUrl: "", link: "/brands" },
                        { id: "4", name: "Home", imageUrl: "", link: "/search?category=home" },
                        { id: "5", name: "Beauty", imageUrl: "", link: "/search?category=beauty" },
                    ]}
                />
            </div>

            {/* Editor's Picks – card-green background (same as header/footer) */}
            <section className="bg-card">
                <div className="max-w-7xl mx-auto">
                    <FeaturedProducts
                        title="Editor's Picks"
                        products={displayEditorsPicks}
                        onToggleFavorite={handleToggleFavorite}
                    />
                </div>
            </section>

            {/* New Arrivals – standard background */}
            <div className="max-w-7xl mx-auto">
                <FeaturedProducts
                    title="New Arrivals"
                    products={newArrivals}
                    onToggleFavorite={handleToggleFavorite}
                />
            </div>

            {/* Sell CTA – ivory-dark box */}
            <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 md:py-14">
                <div className="max-w-2xl mx-auto bg-ivory-dark rounded-2xl px-6 py-6 md:px-8 md:py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl md:text-2xl font-serif text-racing-green mb-1">Sell your pieces</h2>
                        <p className="text-racing-green/60 text-xs max-w-sm">
                            List your pre-owned designer items. We handle authentication and secure payment.
                        </p>
                    </div>
                    <Link href="/products/create">
                        <Button className="bg-racing-green text-ivory hover:bg-racing-green-light font-semibold whitespace-nowrap px-5 text-sm">
                            Sell an item
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Trending Now – card-green background (same as header/footer) */}
            <section className="bg-card">
                <div className="max-w-7xl mx-auto">
                    <FeaturedProducts
                        title="Trending Now"
                        products={displayTrending}
                        onToggleFavorite={handleToggleFavorite}
                    />
                </div>
            </section>
        </div>
    );
};

export default Index;