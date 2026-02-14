"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

interface SearchOverlayProps {
    open: boolean;
    onClose: () => void;
    onResults?: (data: { products: any[]; users: any[] }) => void;
}

export default function SearchOverlay({ open, onClose }: SearchOverlayProps) {
    const [query, setQuery] = useState("");
    const router = useRouter();

    if (!open) return null;

    const handleSearch = () => {
        if (!query.trim()) return;

        // Navigér til search-siden
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);

        // Luk overlayet
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">

            <div className="bg-ivory-dark w-full max-w-md rounded-2xl shadow-xl p-5 relative border border-racing-green/20">

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-racing-green hover:text-burgundy transition"
                >
                    <X className="h-6 w-6" />
                </button>

                {/* Title */}
                <h2 className="text-xl font-bold text-racing-green mb-4 tracking-wide">
                    Search
                </h2>

                {/* Input */}
                <div className="flex items-center gap-3 bg-white border border-racing-green/30 rounded-xl px-4 py-3 shadow-sm">
                    <Search className="h-5 w-5 text-racing-green/70" />
                    <input
                        type="text"
                        placeholder="Search items, brands, designers..."
                        className="w-full bg-transparent outline-none text-racing-green placeholder:text-racing-green/50"
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                </div>

                {/* Search button */}
                <button
                    onClick={handleSearch}
                    className="mt-5 w-full py-3 bg-burgundy text-ivory font-semibold rounded-xl shadow hover:opacity-90 transition"
                >
                    Search
                </button>

            </div>
        </div>
    );
}
