'use client';

import { useState, useEffect, use } from "react";
import { api } from "@/app/api/api";
import ProductPicker from "@/app/components/admin/ProductPicker";
import { useRouter } from "next/navigation";

interface Props {
    params: Promise<{ id: string }>;
}

export default function EditBlogPost({ params }: Props) {
    const router = useRouter();

    // Unwrap params using React.use()
    const resolvedParams = use(params);
    const postId = resolvedParams.id;

    // Base URL til din backend (da admin kører på 3001 og billeder ligger på 3000)
    const baseUrl = "http://localhost:3000";

    // States
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isActive, setIsActive] = useState(false);
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // 1. Fetch existing data on load
    useEffect(() => {
        async function fetchPost() {
            try {
                // RETTELSE: Vi bruger nu den specifikke admin-rute til at hente på ID
                const res = await api(`/api/blogs/admin/id/${postId}`);
                const result = await res.json();

                if (result.success && result.data) {
                    const post = result.data;
                    setTitle(post.title || "");
                    setContent(post.content || "");
                    setIsActive(post.isActive || false);

                    // LOGIK TIL BILLEDE-PREVIEW
                    if (post.image) {
                        if (post.image.startsWith('http')) {
                            setPreviewUrl(post.image);
                        } else {
                            // Vi sikrer os at stien starter med / før vi tilføjer baseUrl
                            const cleanPath = post.image.startsWith('/') ? post.image : `/${post.image}`;
                            setPreviewUrl(`${baseUrl}${cleanPath}`);
                        }
                    }

                    // Map populated objects to IDs for the picker
                    const ids = post.relatedProducts?.map((p: any) => p._id || p.id) || [];
                    setSelectedProductIds(ids);
                } else {
                    console.error("Kunne ikke finde indlægget:", result.message);
                }
            } catch (err) {
                console.error("Error fetching blog post:", err);
            } finally {
                setLoading(false);
            }
        }
        if (postId) fetchPost();
    }, [postId, baseUrl]);

    // 2. Handle Submit
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        formData.append("isActive", String(isActive));
        formData.append("relatedProducts", JSON.stringify(selectedProductIds));

        if (image) {
            formData.append("image", image);
        }

        try {
            const res = await api(`/api/blogs/${postId}`, {
                method: "PUT",
                body: formData,
            });

            if (res.ok) {
                alert("Blog post updated successfully!");
                router.push("/admin/blog");
                router.refresh();
            } else {
                const errData = await res.json();
                alert("Error: " + (errData.error || "Something went wrong"));
            }
        } catch (err) {
            console.error("Submit error:", err);
        }
    }

    if (loading) return <p className="text-black p-6 font-medium italic text-center">Loading post data...</p>;

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100 mt-10 mb-20">
            <h1 className="text-3xl font-bold mb-8 text-black tracking-tight">Edit Blog Post</h1>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Title */}
                <div>
                    <label className="block font-bold text-black mb-2 uppercase text-[10px] tracking-[0.2em]">Headline</label>
                    <input
                        type="text"
                        className="w-full p-4 border border-gray-200 rounded-xl text-black focus:ring-2 focus:ring-black outline-none transition-all"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter post title..."
                        required
                    />
                </div>

                {/* Image Preview & Upload */}
                <div>
                    <label className="block font-bold text-black mb-2 uppercase text-[10px] tracking-[0.2em]">Cover Image</label>
                    <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="w-32 h-32 object-cover rounded-xl shadow-md border-2 border-white" />
                        ) : (
                            <div className="w-32 h-32 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-xs text-center p-2">No image</div>
                        )}
                        <div className="flex-1">
                            <input
                                type="file"
                                accept="image/*"
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-black file:text-white hover:file:bg-gray-800 cursor-pointer transition-all"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setImage(file);
                                        setPreviewUrl(URL.createObjectURL(file));
                                    }
                                }}
                            />
                            <p className="text-[10px] text-gray-400 mt-3 font-medium uppercase tracking-wider">Recommended: 1200x800px. Max 5MB.</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div>
                    <label className="block font-bold text-black mb-2 uppercase text-[10px] tracking-[0.2em]">Content (HTML allowed)</label>
                    <textarea
                        className="w-full p-4 border border-gray-200 rounded-xl h-80 text-black focus:ring-2 focus:ring-black outline-none font-mono text-sm leading-relaxed"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your story here..."
                        required
                    />
                </div>

                <hr className="border-gray-100" />

                {/* SETTINGS SECTION */}
                <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 space-y-8">
                    <h2 className="text-xl font-bold text-black flex items-center gap-2">
                        <span className="w-2 h-2 bg-black rounded-full"></span>
                        Display Settings & Relations
                    </h2>

                    {/* Active Toggle */}
                    <div className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl shadow-sm transition-all hover:border-black/20">
                        <input
                            type="checkbox"
                            id="isActive"
                            className="w-6 h-6 accent-black cursor-pointer"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                        />
                        <label htmlFor="isActive" className="font-bold text-black cursor-pointer flex-1 select-none">
                            Feature this post on the homepage
                            <span className="block font-normal text-gray-500 text-xs mt-0.5">Activating this will replace the current featured post.</span>
                        </label>
                    </div>

                    {/* Product Picker */}
                    <div className="bg-white p-2 rounded-2xl border border-gray-200 overflow-hidden">
                        <ProductPicker
                            selectedIds={selectedProductIds}
                            onSelectionChange={setSelectedProductIds}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6">
                    <button
                        type="submit"
                        className="flex-[2] bg-black text-white px-8 py-5 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl active:scale-[0.98] uppercase text-xs tracking-widest"
                    >
                        Save Changes
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 bg-white text-black border border-gray-200 px-8 py-5 rounded-2xl font-bold hover:bg-gray-50 transition-all uppercase text-xs tracking-widest"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}