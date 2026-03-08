'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/app/api/api";

const API_URL = "/api/admin";

// small inline spinner
function Spinner({ size = 16 }: { size?: number }) {
    return (
        <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.15" strokeWidth="4"></circle>
            <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></path>
        </svg>
    );
}

export default function AdminProductsInReview() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingIds, setUpdatingIds] = useState<string[]>([]);

    // Notifications
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Pagination (client-side simple)
    const [page, setPage] = useState(1);
    const pageSize = 8;

    async function fetchProducts() {
        try {
            const res = await api(`${API_URL}/products/in-review`, {
                credentials: "include",
            });

            if (!res.ok) {
                const txt = await res.text().catch(() => '');
                setNotification({ type: 'error', message: `Failed to load products: ${txt || res.status}` });
                setProducts([]);
                return;
            }

            const data = await res.json();
            // Expecting an array
            setProducts(Array.isArray(data) ? data : data || []);
        } catch (err) {
            console.error("Failed to load products", err);
            setNotification({ type: 'error', message: 'Failed to load products' });
        } finally {
            setLoading(false);
        }
    }

    async function updateStatus(id: string, status: "Approved" | "Rejected") {
        const endpoint = status === "Approved" ? "approve" : "reject";

        // Set updating state for this id
        setUpdatingIds(prev => (prev.includes(id) ? prev : [...prev, id]));

        try {
            const res = await api(`${API_URL}/products/${id}/${endpoint}`, {
                method: "PUT",
                credentials: "include",
            });

            if (res.ok) {
                setNotification({ type: 'success', message: `Product ${status.toLowerCase()} successfully` });
                // Refetch to get fresh list and reset to first page if needed
                await fetchProducts();
                setPage(1);
            } else {
                const txt = await res.text().catch(() => '');
                setNotification({ type: 'error', message: `Failed to ${status.toLowerCase()}: ${txt || res.status}` });
            }
        } catch (err) {
            setNotification({ type: 'error', message: 'Network error' });
        } finally {
            setUpdatingIds(prev => prev.filter(x => x !== id));
            // auto-hide notification
            setTimeout(() => setNotification(null), 3500);
        }
    }

    useEffect(() => {
        fetchProducts();
    }, []);

    const totalPages = Math.max(1, Math.ceil(products.length / pageSize));
    const paginated = products.slice((page - 1) * pageSize, page * pageSize);

    if (loading) {
        return <p className="p-6 text-center">Loading products…</p>;
    }

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">Products in Review</h1>

            {/* Notification */}
            {notification && (
                <div
                    role="status"
                    className={`mb-4 p-3 rounded-md text-sm ${notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {notification.message}
                </div>
            )}

            {products.length === 0 ? (
                <p className="text-gray-500">No products waiting for confirmation</p>
            ) : (
                <>
                    <div className="grid gap-4">
                        {paginated.map((product) => (
                            <div
                                key={product._id}
                                className="p-4 bg-card border border-border/30 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-start"
                            >
                                {/* Thumbnail */}
                                <div className="w-full md:w-40 flex-shrink-0">
                                    <div className="aspect-square rounded-lg overflow-hidden bg-muted/30 border border-border/20">
                                        <img
                                            src={product.images?.[0] || "/images/ImagePlaceholder.jpg"}
                                            alt={product.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 w-full">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                                {product.title}

                                                {/* More prominent preview badge */}
                                                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                                                    <span aria-hidden>👁️</span>
                                                    <span className="font-medium">PREVIEW</span>
                                                </span>
                                            </h3>

                                            <p className="text-sm text-muted-foreground mt-1">Seller: {product.seller?.username || "Unknown"}</p>
                                            <p className="text-sm text-muted-foreground">Price: {product.price} kr</p>
                                            {product.categoryName && (
                                                <p className="text-sm text-muted-foreground">Category: {product.categoryName}</p>
                                            )}
                                        </div>

                                        <div className="text-right flex flex-col items-end gap-2">
                                            <Link
                                                href={`/products/${product._id}?preview=admin`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-foreground/80 underline hover:text-foreground"
                                            >
                                                Open preview
                                            </Link>

                                            <p className="text-xs text-muted-foreground">Posted: {product.createdAt ? new Date(product.createdAt).toLocaleString() : '—'}</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex gap-3 items-center">
                                        <button
                                            onClick={() => updateStatus(product._id, "Approved")}
                                            disabled={updatingIds.includes(product._id)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors flex items-center gap-2"
                                        >
                                            {updatingIds.includes(product._id) ? <><Spinner size={16} /> <span>Processing…</span></> : 'Approve'}
                                        </button>

                                        <button
                                            onClick={() => updateStatus(product._id, "Rejected")}
                                            disabled={updatingIds.includes(product._id)}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors flex items-center gap-2"
                                        >
                                            {updatingIds.includes(product._id) ? <><Spinner size={16} /> <span>Processing…</span></> : 'Reject'}
                                        </button>

                                        <Link
                                            href={`/admin/products/${product._id}`}
                                            className="ml-auto text-sm text-muted-foreground hover:underline"
                                        >
                                            Edit
                                        </Link>
                                    </div>

                                    {/* Optional description preview */}
                                    {product.description && (
                                        <p className="mt-4 text-sm text-muted-foreground line-clamp-3">{product.description}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination controls */}
                    <div className="mt-6 flex items-center justify-center gap-3">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="px-3 py-1 rounded-md bg-card border border-border/20 disabled:opacity-50"
                        >
                            Previous
                        </button>

                        <div className="text-sm text-muted-foreground">Page {page} / {totalPages}</div>

                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                            className="px-3 py-1 rounded-md bg-card border border-border/20 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}