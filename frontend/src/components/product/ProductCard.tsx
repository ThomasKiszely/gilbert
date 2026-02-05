import type { FC } from "react";
import type { Product } from "./types";

interface ProductCardProps {
    product: Product;
    onToggleFavorite: (id: string) => void;
}

const ProductCard: FC<ProductCardProps> = ({ product, onToggleFavorite }) => {
    const { id, title, brand, price, imageUrl, tag, isFavorite } = product;
    console.log("render card", id, title);


    function handleFavoriteClick(e: React.MouseEvent) {
        e.stopPropagation();
        onToggleFavorite(id);
        console.log("clicked", id);

    }

    return (
        <div className="product-card shadow-sm bg-ivory-dark cursor-pointer">
            <div className="relative w-full aspect-[3/4] overflow-hidden">
            {/* Tag badge */}
                {tag && (
                    <span className="absolute top-2 left-2 bg-black/80 text-white px-2 py-1 rounded-full text-[10px] font-medium">
                        {tag}
                    </span>
                )}

                {/* Favorite heart */}
                <button
                    onClick={handleFavoriteClick}
                    className="absolute top-2 right-2"
                >
                    <svg
                        viewBox="0 0 24 24"
                        className={`w-6 h-6 transition ${
                            isFavorite
                                ? "fill-red-500 stroke-red-500"
                                : "fill-transparent stroke-white"
                        }`}
                    >
                        <path d="M12 21s-6.7-4.35-10-9.14C-1.6 7.1 1.4 2 6 2c2.54 0 4 1.66 6 3.76C14 3.66 15.46 2 18 2c4.6 0 7.6 5.1 4 9.86C18.7 16.65 12 21 12 21z"/>
                    </svg>
                </button>

                {/* Product image */}
                <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="px-3 py-4">
                <p className="text-racing-green/80">{brand}</p>

                <h3 className="text-racing-green font-semibold">
                    {title}
                </h3>

                <p className="text-racing-green font-medium">{price} kr.</p>
            </div>
        </div>
    );
};

export default ProductCard;
