"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Trash2, Edit3, ExternalLink, Loader2 } from "lucide-react";

export default function AdminBlogList() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {
        try {
            const res = await fetch('/api/blogs');
            const json = await res.json();

            // Vi tjekker om API'et lykkedes og om der er data
            if (json.success && Array.isArray(json.data)) {
                const cleanPosts = json.data.map((item: any) => {
                    // Vi pakker _doc ud her, da vi ved fra din log, at dataen ligger der
                    const baseData = item._doc ? item._doc : item;
                    return {
                        ...baseData,
                        teaser: item.teaser // Vi beholder teaseren
                    };
                });
                setPosts(cleanPosts);
            }
        } catch (err) {
            console.error("Fejl ved hentning af blogs:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!id) return alert("Fejl: Indlægget har intet ID");
        if (!confirm("Er du sikker på, at du vil slette dette indlæg?")) return;

        try {
            const res = await fetch(`/api/blogs/${id}`, { method: 'DELETE' });
            if (res.ok) {
                // Fjern det slettede indlæg fra listen med det samme
                setPosts(prev => prev.filter(p => p._id !== id));
            } else {
                alert("Kunne ikke slette indlægget fra serveren");
            }
        } catch (err) {
            alert("Netværksfejl: Kunne ikke slette");
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
            <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Henter Journal...</div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto mt-24 px-6 mb-20">
            <header className="flex justify-between items-end border-b border-black pb-8 mb-12">
                <div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter text-black">Blog Administration</h1>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mt-2">Styr dine artikler</p>
                </div>
                <Link
                    href="/admin/blog/new"
                    className="bg-black text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" /> Opret nyt indlæg
                </Link>
            </header>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="border-b border-slate-100">
                        <th className="py-4 text-[10px] font-mono uppercase tracking-widest text-slate-400">Dato</th>
                        <th className="py-4 text-[10px] font-mono uppercase tracking-widest text-slate-400">Titel</th>
                        <th className="py-4 text-[10px] font-mono uppercase tracking-widest text-slate-400 text-right">Handlinger</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                    {posts.map((post, index) => (
                        <tr key={post._id || index} className="group hover:bg-slate-50 transition-colors">
                            <td className="py-6 font-mono text-[11px] text-slate-500">
                                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('da-DK') : 'Journal'}
                            </td>
                            <td className="py-6">
                                <div className="flex items-center gap-4">
                                    {post.image && (
                                        <img src={post.image} alt="" className="w-12 h-12 object-cover grayscale border" />
                                    )}
                                    <span className="font-bold uppercase tracking-tight italic text-black">
                                            {post.title || "Uden titel"}
                                        </span>
                                </div>
                            </td>
                            <td className="py-6 text-right">
                                <div className="flex justify-end gap-4 text-slate-400">
                                    {/* Link til selve blog-siden (denne må gerne åbne i ny fane) */}
                                    <Link
                                        href={`/blog/${post.slug}`}
                                        target="_blank"
                                        className="hover:text-black transition-colors"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </Link>

                                    {/* Link til redigering (Åbner i SAMME fane nu) */}
                                    <Link
                                        href={`/admin/blog/edit/${post._id}`}
                                        className="hover:text-black transition-colors"
                                    >
                                        <Edit3 className="h-4 w-4" />
                                    </Link>

                                    {/* Slet knap */}
                                    <button
                                        onClick={() => handleDelete(post._id)}
                                        className="hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                {posts.length === 0 && (
                    <div className="py-20 text-center text-slate-400 font-mono text-[10px] uppercase tracking-widest">
                        Ingen indlæg fundet...
                    </div>
                )}
            </div>
        </div>
    );
}