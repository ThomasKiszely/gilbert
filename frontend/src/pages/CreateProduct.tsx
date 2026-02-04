import { useEffect, useState } from "react";
import { api } from "../api/api.ts";

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

    useEffect(() => {
        loadDropdowns();
    }, []);

    async function loadDropdowns() {
        const result: any = {};

        for (const [field, url] of Object.entries(endpoints)) {
            try {
                const res = await fetch(url);
                result[field] = await res.json();
            } catch (err) {
                console.error("Failed loading", field, err);
            }
        }

        setDropdowns(result);
    }

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files ? Array.from(e.target.files) : [];
        setImages(files);

        const previews = files.map((file) => URL.createObjectURL(file));
        setPreview(previews);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const form = e.currentTarget;
        const formData = new FormData(form);

        images.forEach((img) => formData.append("images", img));

        try {
            const res = await api("/api/products", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json();
                alert("Error: " + err.message);
                return;
            }

            alert("Product created!");
            form.reset();
            setImages([]);
            setPreview([]);

        } catch (error) {
            console.error(error);
            alert("Something went wrong.");
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-4 text-racing-green">Create Product</h1>

            <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">

                <div>
                    <label className="block font-medium">Title</label>
                    <input name="title" required className="input" />
                </div>

                {Object.keys(endpoints).map((field) => (
                    <div key={field}>
                        <label className="block font-medium capitalize">{field}</label>
                        <select
                            name={field}
                            multiple={field === "tags"}
                            required
                            className="input"
                        >
                            {(dropdowns[field] || []).map((item: any) => (
                                <option key={item._id} value={item._id}>
                                    {item.name || item.label || item.value}
                                </option>
                            ))}
                        </select>
                    </div>
                ))}

                <div>
                    <label className="block font-medium">Gender</label>
                    <select name="gender" required className="input">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Unisex">Unisex</option>
                    </select>
                </div>

                <div>
                    <label className="block font-medium">Price</label>
                    <input type="number" name="price" required className="input" />
                </div>

                <div>
                    <label className="block font-medium">Description</label>
                    <textarea name="description" required className="input" />
                </div>

                <div>
                    <label className="block font-medium">Images</label>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="input"
                    />

                    <div className="flex gap-2 mt-2 flex-wrap">
                        {preview.map((src, i) => (
                            <img
                                key={i}
                                src={src}
                                className="w-24 h-24 object-cover rounded-md border"
                            />
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    className="bg-racing-green text-ivory px-4 py-2 rounded-md hover:bg-racing-green-light"
                >
                    Create Product
                </button>
            </form>
        </div>
    );
}
