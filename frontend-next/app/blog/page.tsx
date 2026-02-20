"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, ArrowRight } from "lucide-react";

export default function PublicBlogIndex() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await fetch('/api/blogs');
                const json = await res.json();

                if (json.success && Array.isArray(json.data)) {
                    // Vi pakker _doc ud her, ligesom vi gjorde i admin
                    const cleanPosts = json.data.map((item: any) => {
                        const baseData = item._doc ? item._doc : item;
                        return {
                            ...baseData,
                            teaser: item.teaser || "" // Teaseren kommer fra din backend service
                        };
                    });
                    setPosts(cleanPosts);
                }
            } catch (err) {
                console.error("Fejl ved hentning af blogindlæg:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-slate-200" />
        </div>
    );

    return (
        <main className="max-w-6xl mx-auto mt-32 px-6 mb-32">
            <header className="mb-24">
                <h1 className="text-7xl font-black italic uppercase tracking-tighter mb-4 text-black">Journal</h1>
                <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-slate-400 italic">News and stories from Gilbert</p>
            </header>

            <div className="grid grid-cols-1 gap-32">
                {posts.length > 0 ? (
                    posts.map((post, index) => (
                        <article key={post._id || index} className="group">
                            <Link href={`/blog/${post.slug}`} className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">

                                {/* Billede-sektion (5 kolonner) */}
                                <div className="md:col-span-5 aspect-[4/5] bg-slate-50 overflow-hidden border border-slate-100">
                                    {post.image ? (
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out scale-105 group-hover:scale-100"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-200 font-mono text-[10px] uppercase tracking-widest">
                                            No picture
                                        </div>
                                    )}
                                </div>

                                {/* Tekst-sektion (7 kolonner) */}
                                <div className="md:col-span-7 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
                                            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Journal'}
                                        </span>
                                        <div className="h-[1px] w-12 bg-slate-100"></div>
                                    </div>

                                    <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-[0.9] text-black group-hover:translate-x-3 transition-transform duration-500">
                                        {post.title}
                                    </h2>

                                    {/* Vi bruger dangerouslySetInnerHTML til teaseren fra din backend */}
                                    <div
                                        className="text-slate-600 leading-relaxed font-serif text-lg line-clamp-3 max-w-xl"
                                        dangerouslySetInnerHTML={{ __html: post.teaser }}
                                    />

                                    <div className="flex items-center gap-3 font-black uppercase text-[10px] tracking-[0.2em] pt-6 text-black">
                                        Read the article <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        </article>
                    ))
                ) : (
                    <div className="py-40 border-t border-black text-center">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-300">Journalen opdateres snart...</p>
                    </div>
                )}
            </div>
        </main>
    );
}