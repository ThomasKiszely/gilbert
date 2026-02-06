'use client';

import { useEffect, useState } from "react";

const API_URL = "/api/admin";

export default function AdminProductsInReview() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchProducts() {
        try {
            const res = await fetch(`${API_URL}/products/in-review`, {
                credentials: "include",
            });

            if (!res.ok) throw new Error("Kunne ikke hente produkter");

            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error("Failed to load products", err);
        } finally {
            setLoading(false);
        }
    }

    async function updateStatus(id: string, status: "Approved" | "Rejected") {
        const endpoint = status === "Approved" ? "approve" : "reject";

        try {
            const res = await fetch(`${API_URL}/products/${id}/${endpoint}`, {
                method: "PUT",
                credentials: "include",
            });

            if (res.ok) {
                fetchProducts();
            } else {
                alert("Something went wrong");
            }
        } catch (err) {
            alert("Netværksfejl");
        }
    }

    useEffect(() => {
        fetchProducts();
    }, []);

    if (loading) {
        return <p className="p-6 text-center">Loading products…</p>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Products in Review</h1>

            {products.length === 0 ? (
                <p className="text-gray-500">No products waiting for confirmation</p>
            ) : (
                <div className="space-y-4">
                    {products.map((product) => (
                        <div
                            key={product._id}
                            className="p-4 bg-white rounded-xl shadow-md border border-gray-100"
                        >
                            <h3 className="text-xl font-semibold">{product.title}</h3>
                            <p className="text-gray-600">Pris: {product.price} kr</p>
                            <p className="text-gray-600">Sælger: {product.seller?.username || "Unknown"}</p>

                            <div className="flex gap-4 mt-4">
                                <button
                                    onClick={() => updateStatus(product._id, "Approved")}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Approve
                                </button>

                                <button
                                    onClick={() => updateStatus(product._id, "Rejected")}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}