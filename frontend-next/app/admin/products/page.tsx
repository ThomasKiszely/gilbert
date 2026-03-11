'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/app/api/api";
import { ChevronLeft, ChevronRight, ExternalLink, Check, Clock, X, CreditCard } from "lucide-react";
import type { ApiProduct } from "@/app/components/product/types";

const PAGE_SIZE = 20;

const STATUS_STYLES: Record<string, string> = {
    "Approved": "bg-emerald-600/40 text-emerald-200 border border-emerald-500/60",
    "In Review": "bg-yellow-500/30 text-yellow-100 border border-yellow-400/60",
    "Rejected": "bg-red-600/40 text-red-200 border border-red-500/60",
    "Sold": "bg-blue-600/40 text-blue-200 border border-blue-500/60",
};

const STATUS_ICONS: Record<string, any> = {
    "Approved": Check,
    "In Review": Clock,
    "Rejected": X,
    "Sold": CreditCard,
};

function StatusBadge({ status }: { status: string }) {
    const cls = STATUS_STYLES[status] ?? "bg-gray-700/30 text-gray-300 border border-gray-600/40";
    const Icon = STATUS_ICONS[status];
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap tracking-wide ${cls}`}>
            {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" /> : null}
            {status}
        </span>
    );
}

function buildProductLink(p: ApiProduct): string {
    if (p.status === "In Review" || p.status === "Rejected") {
        return `/products/${p._id}?preview=admin`;
    }
    return `/products/${p._id}`;
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<ApiProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function fetchProducts() {
            setLoading(true);
            setError(null);
            try {
                const res = await api(`/api/admin/products?page=${page}&limit=${PAGE_SIZE}`, {
                    credentials: "include",
                });

                if (!res.ok) {
                    const txt = await res.text().catch(() => "");
                    if (!cancelled) setError(`Failed to load products: ${txt || res.status}`);
                    return;
                }

                const data = await res.json();
                const list: ApiProduct[] = Array.isArray(data) ? data : data.products ?? data.data ?? [];

                if (!cancelled) {
                    setProducts(list);
                    setHasMore(list.length === PAGE_SIZE);
                }
            } catch (err) {
                if (!cancelled) setError("Network error – could not fetch products.");
                console.error(err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchProducts();
        return () => { cancelled = true; };
    }, [page]);

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 mt-4 md:mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 md:mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold font-serif text-racing-green">All Products</h1>
                    <p className="text-sm text-muted-foreground mt-1">Overview of all uploaded products</p>
                </div>
                <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 self-start sm:self-auto">
                    <ChevronLeft className="h-4 w-4" /> Back to dashboard
                </Link>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-700/20 border border-red-600/40 text-red-300 text-sm">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <svg className="animate-spin h-8 w-8 text-racing-green" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.15" strokeWidth="4" />
                        <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">No products found.</div>
            ) : (
                <>
                    {/* ── Mobile cards (< md) ── */}
                    <div className="flex flex-col gap-3 md:hidden">
                        {products.map((product) => (
                            <div key={product._id} className="bg-ivory-dark border border-border/30 rounded-2xl p-4 flex gap-4">
                                {/* Thumbnail */}
                                <div className="w-16 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-border/20 bg-muted">
                                    {product.images?.[0] ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[10px]">No img</div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                                    <div className="flex items-start justify-between gap-2">
                                        <span className="text-racing-green font-semibold text-sm leading-snug line-clamp-2">
                                            {product.title}
                                        </span>
                                        <StatusBadge status={product.status} />
                                    </div>

                                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                                        {product.brand?.name && <span>{product.brand.name}</span>}
                                        {product.category?.name && <span>· {product.category.name}</span>}
                                        {product.subcategory?.name && <span>· {product.subcategory.name}</span>}
                                    </div>

                                    <span className="text-sm font-semibold text-burgundy">
                                        {product.price?.toLocaleString("da-DK")} kr.
                                    </span>

                                    <Link
                                        href={buildProductLink(product)}
                                        className="mt-1 self-start inline-flex items-center gap-1 text-xs text-burgundy hover:text-burgundy/70 font-semibold transition-colors"
                                        target={product.status === "In Review" || product.status === "Rejected" ? "_blank" : undefined}
                                        rel={product.status === "In Review" || product.status === "Rejected" ? "noopener noreferrer" : undefined}
                                    >
                                        {product.status === "In Review" || product.status === "Rejected" ? "Preview" : "View"}
                                        <ExternalLink className="h-3 w-3" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── Desktop table (≥ md) ── */}
                    <div className="hidden md:block rounded-2xl overflow-hidden border border-border/30 shadow-lg">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-ivory-dark border-b border-border/40">
                                    <th className="px-4 py-3 text-left font-semibold text-burgundy uppercase tracking-wider text-xs">Image</th>
                                    <th className="px-4 py-3 text-left font-semibold text-burgundy uppercase tracking-wider text-xs">Name</th>
                                    <th className="px-4 py-3 text-left font-semibold text-burgundy uppercase tracking-wider text-xs">Brand</th>
                                    <th className="px-4 py-3 text-left font-semibold text-burgundy uppercase tracking-wider text-xs">Category</th>
                                    <th className="px-4 py-3 text-left font-semibold text-burgundy uppercase tracking-wider text-xs hidden lg:table-cell">Subcategory</th>
                                    <th className="px-4 py-3 text-left font-semibold text-burgundy uppercase tracking-wider text-xs">Status</th>
                                    <th className="px-4 py-3 text-left font-semibold text-burgundy uppercase tracking-wider text-xs">Link</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product, idx) => (
                                    <tr
                                        key={product._id}
                                        className={`border-b border-border/20 hover:bg-ivory transition-colors ${idx % 2 === 0 ? "bg-ivory-dark" : "bg-ivory-dark/80"}`}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="w-12 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border/20">
                                                {product.images?.[0] ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[10px]">No img</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-racing-green font-medium line-clamp-2 max-w-[180px] block">{product.title}</span>
                                            <span className="text-sm font-semibold text-burgundy">{product.price?.toLocaleString("da-DK")} kr.</span>
                                        </td>
                                        <td className="px-4 py-3 text-racing-green">
                                            {product.brand?.name ?? <span className="text-muted-foreground italic">—</span>}
                                        </td>
                                        <td className="px-4 py-3 text-racing-green">
                                            {product.category?.name ?? <span className="text-muted-foreground italic">—</span>}
                                        </td>
                                        <td className="px-4 py-3 text-racing-green hidden lg:table-cell">
                                            {product.subcategory?.name ?? <span className="text-muted-foreground italic">—</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={product.status} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link
                                                href={buildProductLink(product)}
                                                className="inline-flex items-center gap-1 text-xs text-burgundy hover:text-burgundy/70 font-semibold transition-colors"
                                                target={product.status === "In Review" || product.status === "Rejected" ? "_blank" : undefined}
                                                rel={product.status === "In Review" || product.status === "Rejected" ? "noopener noreferrer" : undefined}
                                            >
                                                {product.status === "In Review" || product.status === "Rejected" ? "Preview" : "View"}
                                                <ExternalLink className="h-3 w-3" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-6">
                        <span className="text-sm text-muted-foreground">Page {page}</span>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-ivory-dark text-racing-green border border-border/30 text-sm font-medium disabled:opacity-40 hover:border-burgundy/40 transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" /> Previous
                            </button>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={!hasMore}
                                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-ivory-dark text-racing-green border border-border/30 text-sm font-medium disabled:opacity-40 hover:border-burgundy/40 transition-colors"
                            >
                                Next <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
