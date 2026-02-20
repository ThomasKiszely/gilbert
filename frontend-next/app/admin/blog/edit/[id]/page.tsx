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
                const res = await api(`/api/blogs/${postId}`);
                const result = await res.json();

                if (result.success && result.data) {
                    const post = result.data;
                    setTitle(post.title);
                    setContent(post.content);
                    setPreviewUrl(post.image);
                    setIsActive(post.isActive || false);

                    // Map populated objects to IDs for the picker
                    const ids = post.relatedProducts?.map((p: any) => p._id || p.id) || [];
                    setSelectedProductIds(ids);
                }
            } catch (err) {
                console.error("Error fetching blog post:", err);
            } finally {
                setLoading(false);
            }
        }
        if (postId) fetchPost();
    }, [postId]);

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
                router.push("/admin/blogs");
            } else {
                const errData = await res.json();
                alert("Error: " + (errData.error || "Something went wrong"));
            }
        } catch (err) {
            console.error("Submit error:", err);
        }
    }

    if (loading) return <p className="text-black p-6">Loading post data...</p>;

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <h1 className="text-3xl font-bold mb-8 text-black">Edit Blog Post</h1>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Title */}
                <div>
                    <label className="block font-bold text-black mb-2 uppercase text-xs tracking-wider">Headline</label>
                    <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-black outline-none"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter post title..."
                        required
                    />
                </div>

                {/* Image Preview & Upload */}
                <div>
                    <label className="block font-bold text-black mb-2 uppercase text-xs tracking-wider">Cover Image</label>
                    <div className="flex items-start gap-4">
                        {previewUrl && (
                            <img src={previewUrl} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-gray-200" />
                        )}
                        <div className="flex-1">
                            <input
                                type="file"
                                accept="image/*"
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 cursor-pointer"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setImage(file);
                                        setPreviewUrl(URL.createObjectURL(file));
                                    }
                                }}
                            />
                            <p className="text-xs text-gray-400 mt-2">Recommended: WebP or JPG. Max 5MB.</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div>
                    <label className="block font-bold text-black mb-2 uppercase text-xs tracking-wider">Content (HTML allowed)</label>
                    <textarea
                        className="w-full p-4 border border-gray-300 rounded-lg h-80 text-black focus:ring-2 focus:ring-black outline-none font-mono text-sm"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your story here..."
                        required
                    />
                </div>

                <hr className="border-gray-100" />

                {/* SETTINGS SECTION */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-6">
                    <h2 className="text-xl font-bold text-black">Display Settings & Relations</h2>

                    {/* Active Toggle */}
                    <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                        <input
                            type="checkbox"
                            id="isActive"
                            className="w-6 h-6 accent-black cursor-pointer"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                        />
                        <label htmlFor="isActive" className="font-bold text-black cursor-pointer flex-1">
                            Feature this post on the homepage
                            <span className="block font-normal text-gray-500 text-sm">Only one post can be featured at a time.</span>
                        </label>
                    </div>

                    {/* Product Picker */}
                    <ProductPicker
                        selectedIds={selectedProductIds}
                        onSelectionChange={setSelectedProductIds}
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                    <button
                        type="submit"
                        className="flex-1 bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-[0.98]"
                    >
                        Save Changes
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="bg-gray-100 text-black px-8 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}