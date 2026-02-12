"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Product, ApiProduct } from "@/app/components/product/types";
import ProductCard from "@/app/components/product/ProductCard";
import UserCard from "@/app/components/user/UserCard";

interface ApiUser {
    _id: string;
    username: string;
    profile?: {
        avatarUrl?: string;
    };
}


interface SearchResults {
    products: ApiProduct[];
    users: ApiUser[];
}

// MAPPER ApiProduct → Product
function mapApiProductToProduct(api: ApiProduct): Product {
    return {
        id: api._id,
        title: api.title,
        brand: api.brand?.name || "",
        price: api.price,
        imageUrl: api.images?.[0] || "/placeholder.png",
        tag: api.tags?.[0]?.name,
        isFavorite: api.isFavorite ?? false,
    };
}

export default function SearchPage() {
    const searchParams = useSearchParams();
    const q = searchParams.get("q") || "";

    const [results, setResults] = useState<SearchResults>({
        products: [],
        users: []
    });

    const [loading, setLoading] = useState(true);

    const handleToggleFavorite = async (id: string) => {
        await fetch(`/api/products/${id}/favorite`, { method: "POST" });

        setResults(prev => ({
            ...prev,
            products: prev.products.map(p =>
                p._id === id
                    ? { ...p, isFavorite: !p.isFavorite }
                    : p
            )
        }));
    };

    useEffect(() => {
        if (!q) return;

        const fetchResults = async () => {
            setLoading(true);
            const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
            const data = await res.json();
            setResults(data);
            setLoading(false);
        };

        fetchResults();
    }, [q]);

    return (
        <div className="p-4">
            <h1 className="text-xl font-semibold mb-4">Search results for "{q}"</h1>

            {loading && <p>Loading…</p>}

            {!loading && results.users.length === 0 && results.products.length === 0 && (
                <p>No results found.</p>
            )}

            {/* USERS */}
            {results.users.length > 0 && (
                <section className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">Users</h2>

                    <div className="grid grid-cols-1 gap-3">
                        {results.users.map((u) => (
                            <UserCard
                                key={u._id}
                                id={u._id}
                                username={u.username}
                                image={u.profile?.avatarUrl || undefined}
                            />


                        ))}
                    </div>

                </section>
            )}


            {/* PRODUCTS */}
            {results.products.length > 0 && (
                <section>
                    <h2 className="text-lg font-semibold mb-2">Products</h2>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {results.products.map((apiProduct) => {
                            const product = mapApiProductToProduct(apiProduct);
                            return (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onToggleFavorite={handleToggleFavorite}
                                />
                            );
                        })}
                    </div>
                </section>
            )}
        </div>
    );
}
