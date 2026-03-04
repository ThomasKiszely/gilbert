"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/app/api/api";

interface Brand {
    _id: string;
    name: string;
}

export default function BrandsPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const res = await api("/api/brands");
                const data: Brand[] = await res.json();
                setBrands(data.sort((a, b) => a.name.localeCompare(b.name)));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchBrands();
    }, []);

    const filtered = brands.filter((b) =>
        b.name.toLowerCase().includes(search.toLowerCase())
    );

    // Gruppér efter første bogstav, '#' for ikke-bogstaver
    const grouped = filtered.reduce<Record<string, Brand[]>>((acc, brand) => {
        const firstChar = brand.name[0];
        const letter = /[a-zA-Z]/.test(firstChar) ? firstChar.toUpperCase() : '#';
        if (!acc[letter]) acc[letter] = [];
        acc[letter].push(brand);
        return acc;
    }, {});

    // Sortér: '#' først, derefter alfabetisk
    const letters = Object.keys(grouped).sort((a, b) => {
        if (a === '#') return -1;
        if (b === '#') return 1;
        return a.localeCompare(b);
    });

    return (
        <div className="max-w-5xl mx-auto px-4 pt-24 pb-16">

            {/* Breadcrumb */}
            <div className="text-sm text-foreground/60 mb-6">
                <Link href="/" className="hover:text-foreground transition-colors">Forside</Link>
                <span> / Brands</span>
            </div>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-semibold mb-1">Alle brands</h1>
                <p className="text-muted-foreground text-sm">
                    {loading ? "Indlæser…" : `${brands.length} brands`}
                </p>
            </div>

            {/* Søgefelt */}
            <div className="relative mb-10">
                <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                    fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                    type="text"
                    placeholder="Søg efter brand…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full max-w-sm rounded-lg border border-border bg-background pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-foreground/30 placeholder:text-muted-foreground"
                />
            </div>

            {/* Loading skeletons */}
            {loading && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {Array.from({ length: 16 }).map((_, i) => (
                        <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />
                    ))}
                </div>
            )}

            {/* Ingen resultater */}
            {!loading && filtered.length === 0 && (
                <p className="text-muted-foreground text-sm">
                    Ingen brands matcher &quot;{search}&quot;
                </p>
            )}

            {/* Brands grupperet efter bogstav */}
            {!loading && filtered.length > 0 && (
                <div className="space-y-10">
                    {letters.map((letter) => (
                        <div key={letter}>
                            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 border-b border-border/30 pb-2">
                                {letter}
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {grouped[letter].map((brand) => (
                                    <Link
                                        key={brand._id}
                                        href={`/products/filter?brands=${brand._id}`}
                                        className="rounded-lg border border-border/50 px-4 py-2.5 text-sm text-foreground/70 hover:text-foreground hover:border-border hover:bg-muted transition-all truncate"
                                    >
                                        {brand.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
