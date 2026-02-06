'use client';
import {useAuth} from "@/app/context/AuthContext";
import {useRouter} from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/app/api/api";

const endpoints = {
    category: "/api/categories",
    subcategory: "/api/subcategories",
    brand: "/api/brands",
    size: "/api/sizes",
    condition: "/api/conditions",
    color: "/api/colors",
    material: "/api/materials",
    tags: "/api/tags",
};

export default function CreateProduct() {


    const [dropdowns, setDropdowns] = useState<any>({});
    const [images, setImages] = useState<File[]>([]);
    const [preview, setPreview] = useState<string[]>([]);
    const [loadingForm, setLoading] = useState(false);


    useEffect(() => {
        loadDropdowns();
        return () => preview.forEach(url => URL.revokeObjectURL(url));
    }, []);

    async function loadDropdowns() {
        const result: any = {};
        for (const [field, url] of Object.entries(endpoints)) {
            try {
                const res = await fetch(url);
                if (res.ok) {
                    result[field] = await res.json();
                }
            } catch (err) {
                console.error("Failed loading", field, err);
            }
        }
        setDropdowns(result);
    }

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files ? Array.from(e.target.files) : [];
        setImages(files);
        preview.forEach(url => URL.revokeObjectURL(url));
        const previews = files.map((file) => URL.createObjectURL(file));
        setPreview(previews);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const form = e.currentTarget;
        const formData = new FormData(form);
        images.forEach((img) => formData.append("images", img));

        try {
            const res = await api("/api/products", {
                method: "POST",
                body: formData,
                headers: { "Content-Type": "" }
            });

            if (!res.ok) {
                const err = await res.json();
                alert("Error: " + (err.message || "Kunne ikke oprette produkt"));
                setLoading(false);
                return;
            }

            alert("Product created!");
            form.reset();
            setImages([]);
            setPreview([]);
        } catch (error) {
            console.error(error);
            alert("Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        /* Her bruger vi bg-ivory-dark som du bad om */
        <div className="max-w-3xl mx-auto p-8 bg-ivory-dark shadow-2xl mt-10 rounded-2xl text-racing-green">
            <h1 className="text-3xl font-serif font-bold mb-8 border-b border-racing-green/20 pb-4">Create Product</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block font-semibold mb-1 uppercase text-xs tracking-wider">Title</label>
                    <input name="title" required className="w-full p-3 bg-ivory border border-racing-green/20 rounded-lg focus:ring-2 focus:ring-racing-green focus:outline-none text-black" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.keys(endpoints).map((field) => (
                        <div key={field}>
                            <label className="block font-semibold capitalize mb-1 text-xs tracking-wider">{field}</label>
                            <select
                                name={field}
                                multiple={field === "tags"}
                                required
                                className="w-full p-3 bg-ivory border border-racing-green/20 rounded-lg focus:ring-2 focus:ring-racing-green focus:outline-none text-black min-h-[48px]"
                            >
                                {(dropdowns[field] || []).map((item: any) => (
                                    <option key={item._id} value={item._id}>
                                        {item.name || item.label || item.value}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block font-semibold mb-1 uppercase text-xs tracking-wider">Gender</label>
                        <select name="gender" required className="w-full p-3 bg-ivory border border-racing-green/20 rounded-lg focus:ring-2 focus:ring-racing-green focus:outline-none text-black">
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Unisex">Unisex</option>
                        </select>
                    </div>

                    <div>
                        <label className="block font-semibold mb-1 uppercase text-xs tracking-wider">Price (DKK)</label>
                        <input type="number" name="price" required className="w-full p-3 bg-ivory border border-racing-green/20 rounded-lg focus:ring-2 focus:ring-racing-green focus:outline-none text-black" />
                    </div>
                </div>

                <div>
                    <label className="block font-semibold mb-1 uppercase text-xs tracking-wider">Description</label>
                    <textarea name="description" required className="w-full p-3 bg-ivory border border-racing-green/20 rounded-lg focus:ring-2 focus:ring-racing-green focus:outline-none h-32 text-black" />
                </div>

                <div className="bg-ivory/50 p-4 rounded-xl border border-dashed border-racing-green/30">
                    <label className="block font-semibold mb-2 uppercase text-xs tracking-wider">Images</label>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-racing-green file:text-ivory hover:file:bg-racing-green-light cursor-pointer"
                    />

                    {preview.length > 0 && (
                        <div className="flex gap-3 mt-6 flex-wrap">
                            {preview.map((src, i) => (
                                <div key={i} className="relative group">
                                    <img
                                        src={src}
                                        className="w-24 h-24 object-cover rounded-lg border-2 border-racing-green/10 shadow-md transition-transform group-hover:scale-105"
                                        alt="Preview"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loadingForm}
                    className="w-full bg-racing-green text-ivory px-4 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-racing-green-dark transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
                >
                    {loadingForm ? "Processing..." : "Publish Product"}
                </button>
            </form>
        </div>
    );
}