"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, Upload } from "lucide-react";

export default function EditBlogPost() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string; // Dette fanger ID fra mappenavnet [id]

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form states
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [preview, setPreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        // Hvis der ikke er noget ID, kan vi ikke hente noget
        if (!id) {
            console.error("Intet ID fundet i URL params");
            return;
        }

        const fetchPost = async () => {
            try {
                console.log("Henter data for ID:", id);
                const res = await fetch(`/api/blogs/admin/id/${id}`);
                const json = await res.json();

                console.log("Modtaget redigerings-data:", json);

                if (json.success && json.data) {
                    // VI FIXER _DOC LAGET HER (Præcis som i listen)
                    const postData = json.data._doc ? json.data._doc : json.data;

                    setTitle(postData.title || "");
                    setContent(postData.content || "");
                    setPreview(postData.image || null);
                } else {
                    console.error("Kunne ikke finde post data i responset");
                }
            } catch (err) {
                console.error("Netværksfejl ved hentning af indlæg:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("content", content);
            if (imageFile) formData.append("image", imageFile);

            const res = await fetch(`/api/blogs/${id}`, {
                method: "PUT",
                body: formData,
            });

            const json = await res.json();
            if (json.success) {
                router.push("/admin/blog");
                router.refresh();
            } else {
                alert("Could not save: " + json.message);
            }
        } catch (err) {
            alert("Could not update post");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Indlæser indhold...</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto mt-24 px-6 mb-20">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-8 hover:text-black">
                <ArrowLeft className="h-3 w-3" /> Tilbage
            </button>

            <form onSubmit={handleSubmit} className="space-y-12">
                <header className="border-b border-black pb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter">Rediger Post</h1>
                        <p className="text-[10px] font-mono uppercase text-slate-400 mt-2 tracking-widest">Opdater din historie</p>
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-3 bg-black text-white px-8 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save changes"}
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="md:col-span-2 space-y-8">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full text-3xl font-serif border-b border-slate-200 py-2 focus:outline-none focus:border-black bg-transparent italic text-black"
                            placeholder="Title"
                        />
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-96 border border-slate-100 p-6 focus:outline-none focus:ring-1 focus:ring-black text-black bg-white font-serif text-lg leading-relaxed"
                            placeholder="Content..."
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Picture</label>
                        <div className="relative aspect-[3/4] border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden group hover:border-black transition-colors">
                            {preview ? (
                                <img src={preview} alt="Preview" className="w-full h-full object-cover grayscale" />
                            ) : (
                                <Upload className="h-6 w-6 text-slate-300" />
                            )}
                            <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        setImageFile(e.target.files[0]);
                                        setPreview(URL.createObjectURL(e.target.files[0]));
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}