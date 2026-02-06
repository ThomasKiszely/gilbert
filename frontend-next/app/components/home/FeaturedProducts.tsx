import ProductCard from "@/app/components/product/ProductCard";
import type { Product } from "@/app/components/product/types";

interface FeaturedProductsProps {
    title: string;
    products: Product[];
    onToggleFavorite: (id: string) => void;
}

const FeaturedProducts = ({ title, products, onToggleFavorite }: FeaturedProductsProps) => {
    return (
        <section className="px-4 md:px-12 py-10">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">{title}</h2>

            {products.length === 0 ? (
                <p className="text-gray-500 italic text-center py-10">
                    No products found in this section.
                </p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((p) => (
                        <ProductCard
                            key={p.id}
                            product={p}
                            onToggleFavorite={onToggleFavorite}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export default FeaturedProducts;