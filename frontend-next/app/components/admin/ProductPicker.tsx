'use client';

import { useState, useEffect } from "react";
import { api } from "@/app/api/api";

interface ApiProduct {
    _id: string;
    title: string;
    brand?: {
        name: string;
    } | string;
}

interface Props {
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
}

export default function ProductPicker({ selectedIds, onSelectionChange }: Props) {
    const [allProducts, setAllProducts] = useState<ApiProduct[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        api("/api/products")
            .then(res => res.json())
            .then(data => setAllProducts(data))
            .catch(err => console.error("Error fetching products:", err));
    }, []);

    const toggleProduct = (id: string) => {
        if (selectedIds.includes(id)) {
            onSelectionChange(selectedIds.filter(item => item !== id));
        } else if (selectedIds.length < 3) {
            onSelectionChange([...selectedIds, id]);
        } else {
            alert("You can only select up to 3 products.");
        }
    };

    const getBrandName = (brand: any) => {
        if (!brand) return "Unknown Brand";
        if (typeof brand === 'string') return brand;
        return brand.name || "Unknown Brand";
    };

    const filtered = allProducts.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getBrandName(p.brand).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="border border-gray-300 p-5 rounded-xl bg-white shadow-sm">
            <h3 className="text-lg font-bold mb-3 text-black">Select Related Products (Max 3)</h3>

            <input
                type="text"
                placeholder="Search products..."
                className="w-full p-3 mb-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="max-h-72 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {filtered.length > 0 ? (
                    filtered.map(product => (
                        <div
                            key={product._id}
                            onClick={() => toggleProduct(product._id)}
                            className={`p-3 border rounded-lg cursor-pointer flex justify-between items-center transition-all ${
                                selectedIds.includes(product._id)
                                    ? 'bg-gray-100 border-black ring-1 ring-black'
                                    : 'bg-white border-gray-200 hover:border-gray-400'
                            }`}
                        >
                            <div className="flex flex-col">
                                <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">
                                    {getBrandName(product.brand)}
                                </span>
                                <span className="text-black font-medium text-sm">
                                    {product.title}
                                </span>
                            </div>

                            {selectedIds.includes(product._id) ? (
                                <div className="bg-black text-white text-[10px] font-bold px-2 py-1 rounded">
                                    SELECTED
                                </div>
                            ) : (
                                <div className="text-gray-300 text-[10px] font-bold px-2 py-1 border border-gray-200 rounded">
                                    ADD
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 text-sm text-center py-4">No products found.</p>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm font-semibold text-black">
                    Selected: {selectedIds.length} / 3
                </span>
                {selectedIds.length === 3 && (
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Limit reached</span>
                )}
            </div>
        </div>
    );
}