'use client';

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/app/components/product/ProductCard";
import type { Product } from "@/app/components/product/types";

const PER_PAGE = 5;

interface FeaturedProductsProps {
    title: string;
    products: Product[];
    onToggleFavorite: (id: string) => void;
}

const FeaturedProducts = ({ title, products, onToggleFavorite }: FeaturedProductsProps) => {
    const [page, setPage] = useState(0);

    if (products.length === 0) return null;

    const totalPages = Math.ceil(products.length / PER_PAGE);
    const visible = products.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

    return (
        <section className="py-10">
            {/* Header with title + arrows */}
            <div className="flex items-center justify-between mb-8 px-5 sm:px-8 lg:px-0">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground tracking-tight">
                    {title}
                </h2>

                {totalPages > 1 && (
                    <div className="hidden md:flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => p - 1)}
                            disabled={page === 0}
                            className="p-2 rounded-full border border-border/40 text-foreground hover:bg-muted transition disabled:opacity-25 disabled:cursor-not-allowed"
                            aria-label="Previous page"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={page >= totalPages - 1}
                            className="p-2 rounded-full border border-border/40 text-foreground hover:bg-muted transition disabled:opacity-25 disabled:cursor-not-allowed"
                            aria-label="Next page"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Mobile: horizontal scroll with visible scrollbar */}
            <div className="flex gap-4 overflow-x-auto pb-3 px-5 sm:px-8 md:hidden mobile-scroll">
                {products.map((p) => (
                    <div key={p.id} className="shrink-0 w-[42%]">
                        <ProductCard
                            product={p}
                            onToggleFavorite={onToggleFavorite}
                        />
                    </div>
                ))}
            </div>

            {/* Desktop: paginated 5-column grid */}
            <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-5 px-5 sm:px-8 lg:px-0">
                {visible.map((p) => (
                    <ProductCard
                        key={p.id}
                        product={p}
                        onToggleFavorite={onToggleFavorite}
                    />
                ))}
            </div>
        </section>
    );
};

export default FeaturedProducts;