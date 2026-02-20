'use client';

import { useEffect, useState } from "react";
import BlogPost from "@/app/components/home/BlogPost";
import FeaturedProducts from "@/app/components/home/FeaturedProducts";
import CategoryList from "@/app/components/home/CategoryList";
import type { ApiProduct, Product } from "@/app/components/product/types";
import { api } from "@/app/api/api";
import { toggleFavorite } from "@/app/api/favorites";

const Index = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [frontPost, setFrontPost] = useState<any>(null);

    async function loadData() {
        try {
            // 1. Hent produkter (Vi bruger rewrites, så ingen 'http://localhost:3000' her)
            const res = await api("/api/products");
            const data = await res.json();
            const mapped = data.map((p: ApiProduct): Product => ({
                id: p._id,
                title: p.title,
                brand: p.brand?.name || "",
                price: p.price,
                // Rewrites sørger for at /api/images/... rammer rigtigt
                imageUrl: p.images?.[0] || "/images/ImagePlaceholder.jpg",
                tag: p.tags?.[0]?.name,
                isFavorite: p.isFavorite ?? false,
            }));
            setProducts(mapped);

            // 2. HENT DET AKTIVE BLOGINDLÆG
            const blogRes = await api("/api/blogs/front");
            const blogData = await blogRes.json();

            if (blogData.success && blogData.data) {
                const { post, teaser } = blogData.data;

                if (post) {
                    // Vi fjerner HTML-tags så de ikke ødelægger forsiden, og tager de første 150 tegn
                    const cleanTeaser = teaser || post.content?.replace(/<[^>]*>/g, '').substring(0, 150);

                    setFrontPost({
                        ...post,
                        displayTeaser: cleanTeaser
                    });
                }
            }
        } catch (err) {
            console.error("Fejl ved indlæsning af data:", err);
        }
    }

    async function handleToggleFavorite(productId: string) {
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
    }

    useEffect(() => {
        loadData();
    }, []);

    return (
        <div className="pb-10">
            {/* HER ER DIN DYNAMISKE BLOG-SEKTION */}
            <BlogPost
                title={frontPost?.title || "Vintage Office Core"}
                subtitle={frontPost?.displayTeaser || "Shop vintage tailoring – hand-picked pieces for the modern professional."}
                // imageUrl bruger nu også rewrites (f.eks. /api/images/blogs/billede.jpg)
                imageUrl={frontPost?.image || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80"}
                slug={frontPost?.slug}
            />

            <CategoryList
                categories={[
                    { id: "1", name: "Women", imageUrl: "", link: "/search?category=women" },
                    { id: "2", name: "Men", imageUrl: "", link: "/search?category=men" },
                    { id: "3", name: "Designers", imageUrl: "", link: "/search?category=designers" },
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