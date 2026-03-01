'use client';

import { useEffect, useState, useCallback } from "react";
import BlogPost from "@/app/components/home/BlogPost";
import FeaturedProducts from "@/app/components/home/FeaturedProducts";
import CategoryList from "@/app/components/home/CategoryList";
import type { ApiProduct, Product } from "@/app/components/product/types";
import { api } from "@/app/api/api";
import { toggleFavorite } from "@/app/api/favorites";

const Index = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [frontPost, setFrontPost] = useState<any>(null);

    // PERFORMANCE: Brug useCallback til loadData for at undgå unødvendige re-creations
    const loadData = useCallback(async (signal?: AbortSignal) => {
        try {
            const [productsRes, favRes, blogRes] = await Promise.allSettled([
                api("/api/products", { signal }),
                api("/api/favorites", { signal }),
                api("/api/blogs/front", { signal }),
            ]);

            // Byg favoriteIds set
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

            // Map produkter med isFavorite
            if (productsRes.status === "fulfilled" && productsRes.value.ok) {
                const data = await productsRes.value.json();
                setProducts(data.map((p: ApiProduct): Product => ({
                    id: p._id,
                    title: p.title,
                    brand: p.brand?.name || "",
                    price: p.price,
                    imageUrl: p.images?.[0] || "/images/ImagePlaceholder.jpg",
                    tag: p.tags?.[0]?.name,
                    isFavorite: favoriteIds.has(String(p._id)),
                })));
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

    // PERFORMANCE: Stabil handler forhindrer unødvendige re-renders af FeaturedProducts
    const handleToggleFavorite = useCallback(async (productId: string) => {
        // Optimistisk update af UI
        setProducts(prev =>
            prev.map(p =>
                p.id === productId ? { ...p, isFavorite: !p.isFavorite } : p
            )
        );

        const success = await toggleFavorite(productId);

        if (!success) {
            // Rul tilbage hvis API-kaldet fejler
            setProducts(prev =>
                prev.map(p =>
                    p.id === productId ? { ...p, isFavorite: !p.isFavorite } : p
                )
            );
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        loadData(controller.signal);

        return () => controller.abort();
    }, [loadData]);

    return (
        <div className="pb-10">
            <BlogPost
                title={frontPost?.title || "Vintage Office Core"}
                subtitle={frontPost?.displayTeaser || "Shop vintage tailoring – hand-picked pieces for the modern professional."}
                imageUrl={frontPost?.image || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80"}
                slug={frontPost?.slug}
            />

            <CategoryList
                categories={[
                    { id: "1", name: "Women", imageUrl: "", link: "/products/filter?gender=Female" },
                    { id: "2", name: "Men", imageUrl: "", link: "/products/filter?gender=Male" },
                    { id: "3", name: "Brands", imageUrl: "", link: "/brands" },
                    { id: "4", name: "Home", imageUrl: "", link: "/search?category=home" },
                    { id: "5", name: "Beauty", imageUrl: "", link: "/search?category=beauty" },
                ]}
            />

            <FeaturedProducts
                title="New Arrivals"
                products={products}
                onToggleFavorite={handleToggleFavorite}
            />

            <FeaturedProducts
                title="Price Drops"
                products={products.filter((p) => p.tag === "Price Drop")}
                onToggleFavorite={handleToggleFavorite}
            />
        </div>
    );
};

export default Index;