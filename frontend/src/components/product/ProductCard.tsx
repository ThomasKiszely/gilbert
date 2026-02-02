import type { FC } from "react";
import type { Product } from "./types";

const ProductCard: FC<Product> = ({ title, brand, price, imageUrl, tag }) => {
    return (
        <div className="product-card w-full shadow-sm">
        <div className="relative w-full h-56 overflow-hidden">
                {tag && (
                    <span className="absolute top-2 left-2 bg-black/80 text-white px-2 py-1 rounded-full text-[10px] font-medium">
                        {tag}
                    </span>
                )}

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
