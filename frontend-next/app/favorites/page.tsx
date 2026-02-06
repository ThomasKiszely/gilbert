'use client';

import { useEffect, useState } from "react";
import { api } from "@/app/api/api";
import Link from "next/link";

export default function FavoritesPage() {
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const res = await api("/api/favorites");
                const data = await res.json();

                if (!data.success) {
                    setError("Could not load favorites.");
                    return;
                }

                setFavorites(data.favorites || []);
            } catch {
                setError("Server error.");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    if (loading) {
        return <p className="text-center mt-20">Loading favorites…</p>;
    }

    if (error) {
        return <p className="text-center mt-20 text-red-600">{error}</p>;
    }

    if (favorites.length === 0) {
        return (
            <div className="text-center mt-20">
                <h1 className="text-2xl font-semibold mb-4">My Favorites</h1>
                <p className="text-gray-600">You don't have any favorites yet.</p>
                <Link href="/" className="text-blue-600 underline mt-4 inline-block">
                    Go shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto mt-10 px-4">
            <h1 className="text-2xl font-semibold mb-6">My Favorites</h1>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {favorites.map((product) => (
                    <Link
                        key={product._id}
                        href={`/products/${product._id}`}
                        className="block border rounded-lg overflow-hidden shadow hover:shadow-lg transition"
                    >
                        <div className="aspect-square bg-gray-100">
                            <img
                                src={product.images?.[0] || "/images/ImagePlaceholder.jpg"}
                                alt={product.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="p-2">
                            <div className="font-medium truncate">{product.title}</div>
                            <div className="text-sm text-gray-700">{product.price} kr.</div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}