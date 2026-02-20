"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Calendar, Share2 } from "lucide-react";

export default function BlogPostDetail() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug;

    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;

        const fetchPost = async () => {
            try {
                // Her henter vi via SLUG, da det er den offentlige rute
                const res = await fetch(`/api/blogs/${slug}`);
                const json = await res.json();

                if (json.success && json.data) {
                    // VI FIXER _DOC LAGET HER (Præcis som i de andre filer)
                    const postData = json.data._doc ? json.data._doc : json.data;
                    setPost(postData);
                }
            } catch (err) {
                console.error("Fejl ved hentning af artikel:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [slug]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-slate-200" />
        </div>
    );

    if (!post) return (
        <div className="max-w-xl mx-auto mt-40 text-center px-6">
            <h1 className="text-2xl font-black uppercase italic italic mb-4">Article does not exist</h1>
            <Link href="/blog" className="text-[10px] font-mono uppercase tracking-widest underline">Back to the Journal</Link>
        </div>
    );

    return (
        <article className="pb-32">
            {/* Hero Sektion med Billede */}
            <header className="w-full h-[70vh] relative bg-slate-100 overflow-hidden">
                {post.image ? (
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover grayscale"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 font-mono text-[10px] uppercase tracking-widest">
                        No visual presentation
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                    <div className="max-w-6xl mx-auto w-full px-6 pb-12">
                        <Link href="/blog" className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/70 hover:text-white mb-8 transition-colors">
                            <ArrowLeft className="h-3 w-3" /> Back to posts
                        </Link>
                        <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-white leading-[0.85] max-w-4xl">
                            {post.title}
                        </h1>
                    </div>
                </div>
            </header>

            {/* Indholds sektion */}
            <div className="max-w-6xl mx-auto px-6 mt-12 grid grid-cols-1 md:grid-cols-12 gap-12">

                {/* Side-info (Dato, Kategori osv.) */}
                <aside className="md:col-span-3 space-y-8 border-t border-slate-100 pt-8">
                    <div>
                        <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2">Published</span>
                        <div className="flex items-center gap-2 font-bold uppercase italic text-sm">
                            <Calendar className="h-3 w-3" />
                            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Ukendt dato'}
                        </div>
                    </div>
                    <div className="pt-8">
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-slate-400 hover:text-black transition-colors"
                        >
                            <Share2 className="h-3 w-3" /> Share article
                        </button>
                    </div>
                </aside>

                {/* Selve Brødteksten */}
                <main className="md:col-span-8 md:col-start-5">
                    <div
                        className="prose prose-slate prose-xl max-w-none font-serif leading-relaxed text-slate-800
                        first-letter:text-7xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:text-black"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    <footer className="mt-20 pt-12 border-t border-black">
                        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-400">Thanks for reading the Journal</p>
                    </footer>
                </main>
            </div>
        </article>
    );
}