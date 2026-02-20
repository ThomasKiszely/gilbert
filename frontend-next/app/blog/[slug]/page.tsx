import Image from "next/image";
import Link from "next/link";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Vi henter URL'en fra din .env.local. Hvis den ikke findes, falder vi tilbage til localhost:3000
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    // Fetch kører på serveren, så vi skal bruge den fulde URL (baseUrl)
    const res = await fetch(`${baseUrl}/api/blogs/${slug}`, { cache: 'no-store' });
    const result = await res.json();
    const post = result.data;

    if (!post) return <div className="p-20 text-center text-black font-bold">Post not found</div>;

    return (
        <main className="min-h-screen bg-white pb-20 text-black">
            <article className="max-w-4xl mx-auto px-6 py-12">
                {/* 1. OVERSKRIFT */}
                <h1 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">{post.title}</h1>

                {/* 2. BLOG BILLEDE */}
                {post.image && (
                    <div className="relative w-full h-[450px] mb-12 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                            // Vi bruger baseUrl her, så billedet altid findes, uanset om det er lokalt eller live
                            src={post.image.startsWith('http') ? post.image : `${baseUrl}${post.image}`}
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
                    className="prose prose-lg max-w-none mb-20 text-black"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* 4. RELATED PRODUCTS */}
                {post.relatedProducts && post.relatedProducts.length > 0 ? (
                    <section className="border-t border-gray-200 pt-16">
                        <h2 className="text-2xl font-bold mb-10 uppercase tracking-widest">Shop the Story</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {post.relatedProducts.map((product: any) => (
                                <Link href={`/product/${product._id}`} key={product._id} className="group">
                                    <div className="relative aspect-[3/4] mb-4 bg-gray-50 overflow-hidden rounded-lg">
                                        <Image
                                            src={product.images?.[0] ? `${baseUrl}/api/images/products/${product.images[0]}` : '/placeholder.jpg'}
                                            alt={product.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            unoptimized
                                        />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
                                            {product.brand?.name || "Vintage"}
                                        </p>
                                        <h3 className="font-bold text-black group-hover:underline">{product.title}</h3>
                                        <p className="text-sm font-medium mt-1">{product.price} DKK</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                ) : (
                    <p className="text-gray-400 italic text-center py-10 border-t border-gray-100">
                        No related products selected for this post.
                    </p>
                )}

                {/* 5. BACK LINK - Nu rettet til /blog */}
                <div className="mt-20 text-center">
                    <Link href="/blog" className="text-xs font-bold uppercase tracking-widest border-b-2 border-black pb-1 hover:text-gray-500 hover:border-gray-500 transition">
                        Back to All Stories
                    </Link>
                </div>
            </article>
        </main>
    );
}