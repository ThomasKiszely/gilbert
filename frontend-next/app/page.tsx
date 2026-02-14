'use client';

import { useEffect, useState } from "react";
import BlogPost from "@/app/components/home/BlogPost";
import FeaturedProducts from "@/app/components/home/FeaturedProducts";
import CategoryList from "@/app/components/home/CategoryList";
import type { ApiProduct, Product } from "@/app/components/product/types";
import { api } from "@/app/api/api";
import { toggleFavorite } from "@/app/api/favorites"; // ⭐ Rettet sti


const Index = () => {
    const [products, setProducts] = useState<Product[]>([]);

    async function loadProducts() {
        try {
            const res = await api("/api/products");
            const data = await res.json();

            // Vi mapper data så det passer til vores frontend typer
            const mapped = data.map((p: ApiProduct): Product => ({
                id: p._id,
                title: p.title,
                brand: p.brand?.name || "",
                price: p.price,
                imageUrl: p.images?.[0] || "/images/ImagePlaceholder.jpg",
                tag: p.tags?.[0]?.name,
                isFavorite: p.isFavorite ?? false,
            }));

            setProducts(mapped);
        } catch (err) {
            console.error("Fejl ved hentning af produkter:", err);
        }
    }

    async function handleToggleFavorite(productId: string) {
        // Opdater UI med det samme (før backend svarer)
        setProducts(prev =>
            prev.map(p =>
                p.id === productId
                    ? { ...p, isFavorite: !p.isFavorite }
                    : p
            )
        );

        // Synkroniser med backend
        const success = await toggleFavorite(productId);

        // Hvis backenden fejler, ruller vi tilbage (valgfrit men godt)
        if (!success) {
            setProducts(prev =>
                prev.map(p =>
                    p.id === productId
                        ? { ...p, isFavorite: !p.isFavorite }
                        : p
                )
            );
        }
    }

    useEffect(() => {
        loadProducts();
    }, []);

    return (
        <div className="pb-10">
            <BlogPost
                title="Vintage Office Core"
                subtitle="Shop vintage tailoring – hand-picked pieces for the modern professional."
                imageUrl="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80"
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