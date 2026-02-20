"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Save } from "lucide-react";
import { api } from "@/app/api/api";

export default function NewBlogPost() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    // Håndter billede-valg og preview
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    // Find din handleSubmit i new/page.tsx og ret rækkefølgen:
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            // 1. TILFØJ TEKST FØRST
            formData.append("title", title);
            formData.append("content", content);

            // 2. TILFØJ BILLEDE SIDST
            if (image) {
                formData.append("image", image);
            }

            const res = await fetch("/api/blogs", {
                method: "POST",
                body: formData, // Ingen headers nødvendige, fetch ordner det selv
            });

            const json = await res.json();
            if (json.success) {
                router.push("/admin/blog"); // Ret denne til din admin-liste
                router.refresh();
            } else {
                alert("Fejl: " + json.message);
            }
        } catch (err) {
            console.error("Fejl ved oprettelse:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-24 px-6 mb-20">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-8">
                <ArrowLeft className="h-3 w-3" /> Back to dashboard
            </button>

            <form onSubmit={handleSubmit} className="space-y-12">
                {/* Header Section */}
                <header className="border-b border-black pb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter">Create blog post</h1>
                        <p className="text-[10px] font-mono uppercase text-slate-400 mt-2 tracking-widest">Admin Panel / New Post</p>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-3 bg-black text-white px-8 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" /> {loading ? "Saving..." : "Post"}
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Venstre side: Tekst */}
                    <div className="md:col-span-2 space-y-8">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest mb-4 text-slate-400">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full text-3xl font-serif border-b border-slate-200 py-2 focus:outline-none focus:border-black transition-colors bg-transparent italic"
                                placeholder="Enter a sweet header..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest mb-4 text-slate-400">Content (HTML supported)</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full h-96 border border-slate-200 p-6 focus:outline-none focus:ring-1 focus:ring-black focus:border-black font-serif leading-relaxed text-lg text-slate-900 bg-white transition-all shadow-sm"
                                placeholder="Write your story here. You can use <p>, <h2>, <strong> etc."
                                required
                            />
                        </div>
                    </div>

                    {/* Højre side: Billede/Metadata */}
                    <div className="space-y-8">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest mb-4 text-slate-400">Cover picture</label>
                            <div className="relative aspect-[3/4] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 group hover:border-black transition-all cursor-pointer overflow-hidden">
                                {preview ? (
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover grayscale" />
                                ) : (
                                    <>
                                        <Upload className="h-8 w-8 text-slate-300 group-hover:text-black transition-colors" />
                                        <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">Click to upload</span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    accept="image/*"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}