"use client";

import {useSearchParams} from "next/navigation";
import {useEffect, useState} from "react";
import {api} from "@/app/api/api";
import {Product} from "@/app/components/product/types";
import ProductCard from "@/app/components/product/ProductCard";
import {toggleFavorite} from "@/app/api/favorites";


export default function SearchPage() {
    const params = useSearchParams();
    const q = params.get("q") || "";
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        async function fetchProducts() {
            const res = await api(`/api/products/search?q=${q}`);
            if (res.ok) {
                const data = await res.json();

                const mapped = data.map((p: any): Product => ({
                    id: p._id,
                    title: p.title,
                    brand: p.brand?.name || "",
                    price: p.price,
                    imageUrl: p.images?.[0] || "/images/ImagePlaceholder.jpg",
                    tag: p.tags?.[0]?.name,
                    isFavorite: p.isFavorite ?? false,
                }));

                setProducts(mapped);
            }
        }
        if (q) fetchProducts();
    }, [q]);
    async function handleToggleFavorite(productId: string) {
        setProducts(prev =>
            prev.map(p =>
                p.id === productId ? { ...p, isFavorite: !p.isFavorite } : p
            )
        );

        const success = await toggleFavorite(productId);

        if (!success) {
            setProducts(prev =>
                prev.map(p =>
                    p.id === productId ? { ...p, isFavorite: !p.isFavorite } : p
                )
            );
        }
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Search results for: {q}</h1>

            {products.length === 0 && <p>No products found.</p>}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map(product => (
                    <ProductCard key={product.id} product={product} onToggleFavorite={handleToggleFavorite} />
                ))}
            </div>
        </div>
    );
}