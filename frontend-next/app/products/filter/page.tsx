"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/app/api/api";
import ProductCard from "@/app/components/product/ProductCard";
import FilterSidebar, { type ActiveFilters } from "@/app/components/filter/FilterSidebar";
import type { ApiProduct, Product } from "@/app/components/product/types";


export default function FilterPage() {
    const searchParams = useSearchParams();

    const gender = searchParams.get("gender");
    const subcategory = searchParams.get("subcategory");

    const [products, setProducts] = useState<Product[]>([]);
    const [subcategoryName, setSubcategoryName] = useState<string | null>(null);
    const [brandName, setBrandName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    // Initialiser filters direkte fra URL
    const [filters, setFilters] = useState<ActiveFilters>(() => ({
        sort: searchParams.get("sort") ?? "newest",
        brands: searchParams.getAll("brands"),
        conditions: searchParams.getAll("conditions"),
        sizes: searchParams.getAll("sizes"),
        colors: searchParams.getAll("colors"),
        materials: searchParams.getAll("materials"),
        priceMin: searchParams.get("priceMin") ?? "",
        priceMax: searchParams.get("priceMax") ?? "",
    }));

    // Synkroniser filters når URL ændrer sig (fx klik i MegaNav)
    useEffect(() => {
        setFilters({
            sort: searchParams.get("sort") ?? "newest",
            brands: searchParams.getAll("brands"),
            conditions: searchParams.getAll("conditions"),
            sizes: searchParams.getAll("sizes"),
            colors: searchParams.getAll("colors"),
            materials: searchParams.getAll("materials"),
            priceMin: searchParams.get("priceMin") ?? "",
            priceMax: searchParams.get("priceMax") ?? "",
        });
    }, [searchParams]);

    // Toggle favorite
    function toggleFavorite(id: string) {
        setProducts((prev) =>
            prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
        );
    }

    // Hent subcategory-navn
    useEffect(() => {
        if (!subcategory) return;

        const fetchSubcategory = async () => {
            try {
                const res = await api(`/api/subcategories/${subcategory}`);
                const data = await res.json();
                setSubcategoryName(data.name);
            } catch {
                setSubcategoryName(null);
            }
        };

        fetchSubcategory();
    }, [subcategory]);

    // Hent brand-navn hvis kun ét brand er sat fra URL (fx fra MegaNav)
    useEffect(() => {
        if (filters.brands.length !== 1) {
            setBrandName(null);
            return;
        }
        const fetchBrand = async () => {
            try {
                const res = await api(`/api/brands/${filters.brands[0]}`);
                const data = await res.json();
                setBrandName(data.name ?? null);
            } catch {
                setBrandName(null);
            }
        };
        fetchBrand();
    }, [filters.brands]);

    // Hent produkter når filter eller URL-params ændrer sig
    const fetchProducts = useCallback(async () => {
        const hasUrlParams = gender || subcategory;
        const hasSidebarFilters =
            filters.brands.length > 0 ||
            filters.conditions.length > 0 ||
            filters.sizes.length > 0 ||
            filters.colors.length > 0 ||
            filters.materials.length > 0 ||
            filters.priceMin ||
            filters.priceMax;

        if (!hasUrlParams && !hasSidebarFilters) {
            setLoading(false);
            return;
        }

        setLoading(true);

        const params = new URLSearchParams();
        if (gender) params.set("gender", gender);
        if (subcategory) params.set("subcategory", subcategory);
        if (filters.sort) params.set("sort", filters.sort);
        if (filters.priceMin) params.set("priceMin", filters.priceMin);
        if (filters.priceMax) params.set("priceMax", filters.priceMax);
        filters.brands.forEach((id) => params.append("brands", id));
        filters.conditions.forEach((id) => params.append("conditions", id));
        filters.sizes.forEach((id) => params.append("sizes", id));
        filters.colors.forEach((id) => params.append("colors", id));
        filters.materials.forEach((id) => params.append("materials", id));

        try {
            const res = await api(`/api/products/filter?${params.toString()}`);
            const data: ApiProduct[] = await res.json();
            const mapped: Product[] = data.map((p) => ({
                id: p._id,
                title: p.title,
                brand: p.brand?.name || "Ukendt",
                price: p.price,
                imageUrl: p.images?.[0] || "/images/ImagePlaceholder.jpg",
                tag: p.tags?.[0]?.name,
                isFavorite: p.isFavorite || false,
            }));

            setProducts(mapped);
        } catch (err) {
            console.error("Fejl ved hentning af produkter:", err);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [gender, subcategory, filters]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return (
        <div className="max-w-7xl mx-auto px-4 pt-24 pb-10">

            {/* Breadcrumb */}
            <div className="text-sm text-foreground/60 mb-4">
                <span>Forside</span>
                {brandName ? (
                    <>
                        <span> / </span>
                        <a href="/brands" className="hover:text-foreground transition-colors">Brands</a>
                        <span> / {brandName}</span>
                    </>
                ) : (
                    <>
                        {gender && <span> / {gender}</span>}
                        {subcategoryName && <span> / {subcategoryName}</span>}
                    </>
                )}
            </div>

            {/* Titel + produkt-antal + mobil filter-knap */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-semibold">
                    {brandName
                        ? brandName
                        : <>
                            {gender && `${gender}`}
                            {subcategoryName && ` — ${subcategoryName}`}
                          </>
                    }
                </h1>
                <div className="flex items-center gap-3">
                    {!loading && (
                        <span className="text-sm text-muted-foreground">
                            {products.length} {products.length === 1 ? "produkt" : "produkter"}
                        </span>
                    )}
                    {/* Filter-knap — kun synlig på mobil */}
                    <button
                        onClick={() => setMobileFilterOpen(true)}
                        className="md:hidden flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M3 4h18M7 12h10M10 20h4" strokeLinecap="round" />
                        </svg>
                        Filter
                        {(filters.brands.length + filters.conditions.length + filters.sizes.length + filters.colors.length + filters.materials.length + (filters.priceMin ? 1 : 0) + (filters.priceMax ? 1 : 0)) > 0 && (
                            <span className="ml-0.5 rounded-full bg-foreground text-background text-xs w-5 h-5 flex items-center justify-center font-bold">
                                {filters.brands.length + filters.conditions.length + filters.sizes.length + filters.colors.length + filters.materials.length + (filters.priceMin ? 1 : 0) + (filters.priceMax ? 1 : 0)}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <div className="flex gap-8 items-start">

                {/* Sidebar */}
                <FilterSidebar
                    filters={filters}
                    onChange={setFilters}
                    mobileOpen={mobileFilterOpen}
                    onClose={() => setMobileFilterOpen(false)}
                />

                {/* Produkt grid */}
                <div className="flex-1 min-w-0">
                    {loading && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="aspect-[3/4] rounded-lg bg-muted animate-pulse"
                                />
                            ))}
                        </div>
                    )}

                    {!loading && products.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <p className="text-lg font-medium text-foreground/70 mb-2">
                                Ingen produkter fundet
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Prøv at justere dine filtre
                            </p>
                        </div>
                    )}

                    {!loading && products.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onToggleFavorite={toggleFavorite}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
