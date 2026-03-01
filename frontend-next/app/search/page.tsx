"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import type { Product, ApiProduct } from "@/app/components/product/types";
import ProductCard from "@/app/components/product/ProductCard";
import UserCard from "@/app/components/user/UserCard";
import { toggleFavorite } from "@/app/api/favorites";

interface ApiUser {
    _id: string;
    username: string;
    profile?: { avatarUrl?: string };
}

interface SearchResults {
    products: Product[];
    users: ApiUser[];
}

export default function SearchPage() {
    const searchParams = useSearchParams();
    const q = searchParams.get("q") || "";

    const [results, setResults] = useState<SearchResults>({ products: [], users: [] });
    const [loading, setLoading] = useState(true);

    // PERFORMANCE: Stabiliseret handler med useCallback
    const handleToggleFavorite = useCallback(async (id: string) => {
        // Optimistic update
        setResults(prev => ({
            ...prev,
            products: prev.products.map(p =>
                p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
            )
        }));

        const success = await toggleFavorite(id);

        if (!success) {
            // Roll back on failure
            setResults(prev => ({
                ...prev,
                products: prev.products.map(p =>
                    p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
                )
            }));
        }
    }, []);

    useEffect(() => {
        if (!q) {
            setResults({ products: [], users: [] });
            setLoading(false);
            return;
        }

        // PERFORMANCE: AbortController forhindrer race-conditions ved hurtig tastning
        const controller = new AbortController();

        const fetchResults = async () => {
            setLoading(true);
            try {
                const [searchRes, favRes] = await Promise.allSettled([
                    fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal }),
                    fetch("/api/favorites", { credentials: "include", signal: controller.signal }),
                ]);

                let favoriteIds = new Set<string>();
                if (favRes.status === "fulfilled" && favRes.value.ok) {
                    const favData = await favRes.value.json();
                    if (favData.success) {
                        favoriteIds = new Set(
                            (favData.favorites || []).map((f: any) => String(f._id))
                        );
                    }
                }

                if (searchRes.status === "fulfilled" && searchRes.value.ok) {
                    const data = await searchRes.value.json();

                    const mappedProducts = (data.products || []).map((p: ApiProduct): Product => ({
                        id: p._id,
                        title: p.title,
                        brand: p.brand?.name || "",
                        price: p.price,
                        imageUrl: p.images?.[0] || "/placeholder.png",
                        tag: p.tags?.[0]?.name,
                        isFavorite: favoriteIds.has(String(p._id)),
                    }));

                    setResults({
                        users: data.users || [],
                        products: mappedProducts,
                    });
                }
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    console.error("Search error:", err);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchResults();

        return () => controller.abort();
    }, [q]);

    return (
        <div className="p-4">
            <h1 className="text-xl font-semibold mb-4">Search results for "{q}"</h1>

            {loading && <p className="text-muted-foreground animate-pulse">Loading…</p>}

            {!loading && results.users.length === 0 && results.products.length === 0 && (
                <p className="text-muted-foreground italic">No results found.</p>
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
                        {results.products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onToggleFavorite={handleToggleFavorite}
                            />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}