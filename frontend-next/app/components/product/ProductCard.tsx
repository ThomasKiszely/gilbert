'use client';

import type { FC } from "react";
import Link from "next/link";
import { Star } from "lucide-react";

// Vi udvider interfacet så det matcher det data vi sender fra profilsiden
interface Product {
    id: string;
    title: string;
    brand: string;
    price: number;
    imageUrl: string;
    tag?: string;
    isFavorite: boolean;
    seller?: {
        username?: string;
        rating?: number;
    };
}

interface ProductCardProps {
    product: Product;
    onToggleFavorite: (id: string) => void;
}

const ProductCard: FC<ProductCardProps> = ({ product, onToggleFavorite }) => {
    const { id, title, brand, price, imageUrl, tag, isFavorite, seller } = product;

    function handleFavoriteClick(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        onToggleFavorite(id);
    }

    return (
        <Link href={`/products/${id}`} className="block group">
            <div className="product-card shadow-sm bg-ivory-dark cursor-pointer rounded-xl overflow-hidden border border-transparent hover:border-racing-green/10 transition-all hover:shadow-md">
                <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-100">

                    {/* Tag badge */}
                    {tag && (
                        <span className="absolute top-3 left-3 z-10 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                            {tag}
                        </span>
                    )}

                    {/* Favorite heart */}
                    <button
                        onClick={handleFavoriteClick}
                        className="absolute top-3 right-3 z-20 p-1.5 hover:scale-110 transition-transform bg-black/10 rounded-full backdrop-blur-sm"
                        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            className={`w-5 h-5 transition-colors duration-300 ${
                                isFavorite
                                    ? "fill-red-500 stroke-red-500"
                                    : "fill-transparent stroke-white"
                            }`}
                            strokeWidth="2.5"
                        >
                            <path d="M12 21s-6.7-4.35-10-9.14C-1.6 7.1 1.4 2 6 2c2.54 0 4 1.66 6 3.76C14 3.66 15.46 2 18 2c4.6 0 7.6 5.1 4 9.86C18.7 16.65 12 21 12 21z"/>
                        </svg>
                    </button>

                    {/* Product image */}
                    <img
                        src={imageUrl || "/images/ImagePlaceholder.jpg"}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                </div>

                <div className="px-4 py-4">
                    <p className="text-racing-green/50 text-[10px] font-black uppercase tracking-[0.15em] mb-1">
                        {brand}
                    </p>

                    <h3 className="text-racing-green font-serif font-bold italic truncate text-base mb-1">
                        {title}
                    </h3>

                    <div className="flex justify-between items-end mt-2">
                        <p className="text-racing-green font-black text-sm">
                            {price} kr.
                        </p>

                        {/* ⭐ Sælger rating sektion */}
                        {seller?.rating !== undefined && seller.rating > 0 && (
                            <div className="flex items-center gap-1 bg-racing-green/5 px-2 py-1 rounded-lg">
                                <Star size={10} className="fill-racing-green text-racing-green" />
                                <span className="text-[10px] font-black text-racing-green">
                                    {Number(seller.rating).toFixed(1)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;