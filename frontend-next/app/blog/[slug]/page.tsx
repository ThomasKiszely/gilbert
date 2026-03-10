import Image from "next/image";
import Link from "next/link";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/blogs/${slug}`, { cache: 'no-store' });
    const result = await res.json();
    const post = result.data;

    if (!post) return <div className="p-20 text-center text-black font-bold">Post not found</div>;

    const getProductImageUrl = (img: string) => {
        if (!img) return '/placeholder.jpg';
        if (img.startsWith('http')) return img;
        if (img.startsWith('/api/images/products/')) return `${baseUrl}${img}`;
        return `${baseUrl}/api/images/products/${img}`;
    };

    return (
        <main className="min-h-screen bg-white pb-20 text-black">
            <article className="max-w-5xl mx-auto px-6 py-12">
                {/* 1. OVERSKRIFT */}
                <h1 className="text-4xl md:text-7xl font-bold mb-12 tracking-tighter uppercase italic">{post.title}</h1>

                {/* 2. BLOG BILLEDE */}
                {post.image && (
                    <div className="relative w-full h-[500px] mb-16 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                            src={post.image.startsWith('http') ? post.image : `${baseUrl}${post.image.startsWith('/') ? '' : '/'}${post.image}`}
                            alt={post.title}
                            fill
                            priority
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                )}

                {/* 3. INDHOLD */}
                <div
                    className="prose prose-lg max-w-3xl mx-auto mb-24 text-black leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* 4. RELATED PRODUCTS (Kompakt layout til mange produkter) */}
                {post.relatedProducts && post.relatedProducts.length > 0 ? (
                    <section className="border-t border-gray-200 pt-20">
                        <h2 className="text-xl font-bold mb-12 uppercase tracking-widest text-center">
                            Shop the story ({post.relatedProducts.length} items)
                        </h2>

                        {/* Grid med 3-6 kolonner for kompakt visning */}
                        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
                            {post.relatedProducts.map((product: any) => (
                                <Link href={`/product/${product._id}`} key={product._id} className="group">
                                    <div className="relative aspect-[3/4] mb-2 bg-gray-50 overflow-hidden rounded border border-gray-100">
                                        <Image
                                            src={getProductImageUrl(product.images?.[0])}
                                            alt={product.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            unoptimized
                                        />
                                    </div>
                                    <div className="text-center px-1">
                                        <h3 className="font-bold text-black text-[10px] uppercase truncate">
                                            {product.title}
                                        </h3>
                                        <p className="text-[9px] font-medium text-gray-500">{product.price} DKK</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                ) : (
                    <p className="text-gray-400 italic text-center py-20 border-t border-gray-100">
                        No products tagged in this story yet.
                    </p>
                )}

                {/* 5. BACK LINK */}
                <div className="mt-32 text-center">
                    <Link href="/blog" className="text-[10px] font-bold uppercase tracking-[0.3em] border-b-2 border-black pb-2 hover:text-gray-500 hover:border-gray-500 transition-all">
                        Back to All Stories
                    </Link>
                </div>
            </article>
        </main>
    );
}