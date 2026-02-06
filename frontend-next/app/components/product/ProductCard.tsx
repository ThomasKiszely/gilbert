'use client';

import type { FC } from "react";
import type { Product } from "./types";
import Link from "next/link";

interface ProductCardProps {
    product: Product;
    onToggleFavorite: (id: string) => void;
}

const ProductCard: FC<ProductCardProps> = ({ product, onToggleFavorite }) => {
    const { id, title, brand, price, imageUrl, tag, isFavorite } = product;

    function handleFavoriteClick(e: React.MouseEvent) {
        e.preventDefault(); // Forhindrer at vi navigerer til produktsiden når vi trykker på hjertet
        e.stopPropagation();
        onToggleFavorite(id);
    }

    return (
        <Link href={`/products/${id}`} className="block">
            <div className="product-card shadow-sm bg-ivory-dark cursor-pointer group rounded-sm overflow-hidden border border-transparent hover:border-gray-100 transition-all">
                <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-100">

                    {/* Tag badge */}
                    {tag && (
                        <span className="absolute top-2 left-2 z-10 bg-black/80 text-white px-2 py-1 rounded-full text-[10px] font-medium tracking-tight">
                            {tag}
                        </span>
                    )}

                    {/* Favorite heart */}
                    <button
                        onClick={handleFavoriteClick}
                        className="absolute top-2 right-2 z-20 p-1 hover:scale-110 transition-transform"
                        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            className={`w-6 h-6 transition-colors duration-300 ${
                                isFavorite
                                    ? "fill-red-500 stroke-red-500"
                                    : "fill-transparent stroke-white"
                            }`}
                            strokeWidth="2"
                        >
                            <path d="M12 21s-6.7-4.35-10-9.14C-1.6 7.1 1.4 2 6 2c2.54 0 4 1.66 6 3.76C14 3.66 15.46 2 18 2c4.6 0 7.6 5.1 4 9.86C18.7 16.65 12 21 12 21z"/>
                        </svg>
                    </button>

                    {/* Product image */}
                    <img
                        src={imageUrl || "/images/ImagePlaceholder.jpg"}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                </div>

                <div className="px-3 py-4">
                    <p className="text-racing-green/70 text-xs uppercase tracking-wider mb-1">
                        {brand}
                    </p>

                    <h3 className="text-racing-green font-semibold truncate text-sm md:text-base">
                        {title}
                    </h3>

                    <p className="text-racing-green font-bold mt-1">
                        {price} kr.
                    </p>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;