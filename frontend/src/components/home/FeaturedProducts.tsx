import ProductCard from "../product/ProductCard.tsx";
import type { Product } from "../product/types.ts";

interface FeaturedProductsProps {
    title: string;
    products: Product[];
    onToggleFavorite: (id: string) => void;
}

const FeaturedProducts = ({ title, products, onToggleFavorite }: FeaturedProductsProps) => {
    return (
        <section className="px-12 py-10">
            <h2 className="text-3xl font-semibold mb-6">{title}</h2>

            <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                {products.map((p) => (
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
