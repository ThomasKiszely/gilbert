import { useEffect, useState } from "react";
import BlogPost from "../components/home/BlogPost.tsx";
import FeaturedProducts from "../components/home/FeaturedProducts.tsx";
import CategoryList from "../components/home/CategoryList.tsx";
import type {ApiProduct,Product} from "../components/product/types.ts";

const Index = () => {
    const [products, setProducts] = useState<Product[]>([]);

    async function loadProducts() {
        const res = await fetch("/api/products");
        const data = await res.json();

        const mapped = data.map((p: ApiProduct) : Product => ({
            id: p.id,
            title: p.title,
            brand: p.brand?.name || "",
            price: p.price,
            imageUrl: p.images?.[0] || "/images/ImagePlaceholder.jpg",
            tag: p.tags?.[0]?.name,
        }));

        setProducts(mapped);
    }

    useEffect(() => {
        loadProducts();
    }, []);

    return (
        <>
            <BlogPost
                title="Vintage Office Core"
                subtitle="Shop vintage tailoring – hand-picked pieces for the modern professional."
                imageUrl="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80"
            />

            <CategoryList
                categories={[
                    { id: "1", name: "Women", imageUrl: "", link: "/search?category=women" },
                    { id: "2", name: "Men", imageUrl: "", link: "/search?category=men" },
                    { id: "3", name: "Designers", imageUrl: "", link: "/search?category=designers" },
                    { id: "4", name: "Home", imageUrl: "", link: "/search?category=home" },
                    { id: "5", name: "Beauty", imageUrl: "", link: "/search?category=beauty" },
                ]}
            />

            <FeaturedProducts title="New Arrivals" products={products} />

            <FeaturedProducts
                title="Price Drops"
                products={products.filter((p) => p.tag === "Price Drop")}
            />

        </>
    );
};

export default Index;
