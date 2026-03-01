"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { api } from "@/app/api/api";
import { toggleFavorite } from "@/app/api/favorites";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/app/components/product/ProductCard";
import FilterSidebar, { type ActiveFilters } from "@/app/components/filter/FilterSidebar";
import type { ApiProduct, Product } from "@/app/components/product/types";

const mapProduct = (p: ApiProduct): Product => ({
    id: p._id,
    title: p.title,
    brand: p.brand?.name || "Unknown",
    price: p.price,
    imageUrl: p.images?.[0] || "/images/ImagePlaceholder.jpg",
    tag: p.tags?.[0]?.name,
    isFavorite: p.isFavorite === true,
});

export default function FilterPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [products, setProducts] = useState<Product[]>([]);
    const [subcategoryName, setSubcategoryName] = useState<string | null>(null);
    const [brandName, setBrandName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    const gender = searchParams.get("gender");
    const subcategory = searchParams.get("subcategory");

    const filters = useMemo<ActiveFilters>(() => ({
        sort: searchParams.get("sort") ?? "newest",
        brands: searchParams.getAll("brands"),
        conditions: searchParams.getAll("conditions"),
        sizes: searchParams.getAll("sizes"),
        colors: searchParams.getAll("colors"),
        materials: searchParams.getAll("materials"),
        priceMin: searchParams.get("priceMin") ?? "",
        priceMax: searchParams.get("priceMax") ?? "",
    }), [searchParams]);

    const handleFilterChange = useCallback((newFilters: ActiveFilters) => {
        const params = new URLSearchParams();
        if (gender) params.set("gender", gender);
        if (subcategory) params.set("subcategory", subcategory);

        Object.entries(newFilters).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach(v => params.append(key, v));
            } else if (value) {
                params.set(key, value);
            }
        });

        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [gender, subcategory, pathname, router]);

    useEffect(() => {
        const controller = new AbortController();

        async function fetchData() {
            setLoading(true);
            try {
                // PERFORMANCE: Hent ALT parallelt i stedet for sekventielt
                const [productRes, favRes, subRes, brandRes] = await Promise.allSettled([
                    api(`/api/products/filter?${searchParams.toString()}`, { signal: controller.signal }),
                    api("/api/favorites"),
                    subcategory ? api(`/api/subcategories/${subcategory}`) : Promise.resolve(null),
                    (!gender && !subcategory && filters.brands.length === 1)
                        ? api(`/api/brands/${filters.brands[0]}`)
                        : Promise.resolve(null)
                ]);

                // 1. Håndter Favorites
                let favoriteIds = new Set<string>();
                if (favRes.status === "fulfilled" && favRes.value?.ok) {
                    const favData = await favRes.value.json();
                    if (favData.success) {
                        favoriteIds = new Set((favData.favorites || []).map((f: any) => String(f._id)));
                    }
                }

                // 2. Håndter Produkter
                if (productRes.status === "fulfilled" && productRes.value?.ok) {
                    const productData: ApiProduct[] = await productRes.value.json();
                    setProducts(productData.map(p => ({
                        ...mapProduct(p),
                        isFavorite: favoriteIds.has(String(p._id)),
                    })));
                }

                // 3. Håndter Subcategory navn
                if (subRes.status === "fulfilled" && subRes.value?.ok) {
                    const subData = await subRes.value.json();
                    setSubcategoryName(subData?.name || null);
                } else {
                    setSubcategoryName(null);
                }

                // 4. Håndter Brand navn
                if (brandRes.status === "fulfilled" && brandRes.value?.ok) {
                    const brandData = await brandRes.value.json();
                    setBrandName(brandData?.name || null);
                } else {
                    setBrandName(null);
                }

            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    console.error("Fetch error:", err);
                    setProducts([]);
                }
            } finally {
                setLoading(false);
            }
        }

        fetchData();
        return () => controller.abort();
    }, [searchParams, gender, subcategory, filters.brands]);

    const handleToggleFavorite = useCallback(async (productId: string) => {
        setProducts(prev =>
            prev.map(p => p.id === productId ? { ...p, isFavorite: !p.isFavorite } : p)
        );
        const success = await toggleFavorite(productId);
        if (!success) {
            setProducts(prev =>
                prev.map(p => p.id === productId ? { ...p, isFavorite: !p.isFavorite } : p)
            );
        }
    }, []);

    const showBrandTitle = !gender && !subcategory && !!brandName;

    const activeFilterCount = useMemo(() => {
        return filters.brands.length + filters.conditions.length + filters.sizes.length +
            filters.colors.length + filters.materials.length +
            (filters.priceMin ? 1 : 0) + (filters.priceMax ? 1 : 0);
    }, [filters]);

    return (
        <div className="max-w-7xl mx-auto px-4 pt-6 pb-10">
            <nav className="flex items-center gap-1.5 text-xs text-muted-foreground py-4 mb-2">
                <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                {showBrandTitle ? (
                    <>
                        <ChevronRight className="h-3 w-3" />
                        <Link href="/brands" className="hover:text-foreground transition-colors">Brands</Link>
                        <ChevronRight className="h-3 w-3" />
                        <span className="text-foreground">{brandName}</span>
                    </>
                ) : (
                    <>
                        {gender && (
                            <>
                                <ChevronRight className="h-3 w-3" />
                                <Link
                                    href={`/products/filter?gender=${gender}`}
                                    className="hover:text-foreground transition-colors capitalize"
                                >
                                    {gender}
                                </Link>
                            </>
                        )}
                        {subcategoryName && (
                            <>
                                <ChevronRight className="h-3 w-3" />
                                <span className="text-foreground">{subcategoryName}</span>
                            </>
                        )}
                    </>
                )}
            </nav>

            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-semibold capitalize min-h-[32px]">
                    {showBrandTitle ? brandName : (gender || "Products")}
                    {subcategoryName && ` — ${subcategoryName}`}
                </h1>

                <div className="flex items-center gap-3">
                    {!loading && (
                        <span className="text-sm text-muted-foreground">
                            {products.length} {products.length === 1 ? "product" : "products"}
                        </span>
                    )}

                    <button
                        onClick={() => setMobileFilterOpen(true)}
                        className="md:hidden flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M3 4h18M7 12h10M10 20h4" strokeLinecap="round" strokeWidth="2" />
                        </svg>
                        Filter
                        {activeFilterCount > 0 && (
                            <span className="ml-1 rounded-full bg-foreground text-background text-[10px] w-5 h-5 flex items-center justify-center font-bold">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <div className="flex gap-8 items-start">
                <FilterSidebar
                    filters={filters}
                    onChange={handleFilterChange}
                    mobileOpen={mobileFilterOpen}
                    onClose={() => setMobileFilterOpen(false)}
                    hideBrands={showBrandTitle}
                />

                <main className="flex-1 min-w-0">
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="aspect-[3/4] rounded-lg bg-muted animate-pulse" />
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <p className="text-lg font-medium text-foreground/70">No products found</p>
                            <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onToggleFavorite={handleToggleFavorite}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}