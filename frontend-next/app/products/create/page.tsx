'use client';
import { useEffect, useState, useRef } from "react";
import { api } from "@/app/api/api";
import CustomDropdown from "@/app/components/UI/CustomDropdown";

type DropdownItem = { _id: string; name?: string; label?: string; value?: string };

export default function CreateProduct() {
    const [categories, setCategories] = useState<DropdownItem[]>([]);
    const [subcategories, setSubcategories] = useState<DropdownItem[]>([]);
    const [brands, setBrands] = useState<DropdownItem[]>([]);
    const [genders, setGenders] = useState<DropdownItem[]>([]);
    const [sizes, setSizes] = useState<DropdownItem[]>([]);
    const [conditions, setConditions] = useState<DropdownItem[]>([]);
    const [colors, setColors] = useState<DropdownItem[]>([]);
    const [materials, setMaterials] = useState<DropdownItem[]>([]);
    const [tags, setTags] = useState<DropdownItem[]>([]);

    const [selectedGender, setSelectedGender] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedCondition, setSelectedCondition] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [selectedMaterial, setSelectedMaterial] = useState("");

    const [images, setImages] = useState<File[]>([]);
    const [preview, setPreview] = useState<string[]>([]);
    const [loadingForm, setLoading] = useState(false);
    const [isGenderDisabled, setIsGenderDisabled] = useState(false);

    const [showBrandDropdown, setShowBrandDropdown] = useState(false);
    const brandInputRef = useRef<HTMLInputElement>(null);
    const [selectedBrand, setSelectedBrand] = useState("");

    // Load static dropdowns once
    useEffect(() => {
        async function loadStatic() {
            const endpoints: Record<string, string> = {
                category: "/api/categories",
                brand: "/api/brands",
                gender: "/api/genders",
                condition: "/api/conditions",
                color: "/api/colors",
                material: "/api/materials",
                tags: "/api/tags",
            };
            for (const [field, url] of Object.entries(endpoints)) {
                try {
                    const res = await fetch(url);
                    if (!res.ok) continue;
                    const data = await res.json();
                    if (field === "category") setCategories(data);
                    else if (field === "brand") setBrands(data);
                    else if (field === "gender") setGenders(data);
                    else if (field === "condition") setConditions(data);
                    else if (field === "color") setColors(data);
                    else if (field === "material") setMaterials(data);
                    else if (field === "tags") setTags(data);
                } catch (err) {
                    console.error("Failed loading", field, err);
                }
            }
        }
        loadStatic();
        return () => preview.forEach(url => URL.revokeObjectURL(url));
    }, []);

    // When gender or category changes → reload subcategories filtered by both
    useEffect(() => {
        async function loadSubcategories() {
            if (!selectedCategory) {
                setSubcategories([]);
                setIsGenderDisabled(false);
                return;
            }
            try {
                const genderItem = genders.find(g => g._id === selectedGender);
                const genderName = genderItem?.name || "";
                let url = `/api/subcategories?category=${selectedCategory}`;
                if (genderName) url += `&gender=${encodeURIComponent(genderName)}`;
                const res = await fetch(url);
                if (res.ok) {
                    const subs = await res.json();
                    setSubcategories(subs);
                    // Check if all subcategories have gender: []
                    const allNoGender = subs.length > 0 && subs.every((s: any) => Array.isArray(s.gender) && s.gender.length === 0);
                    setIsGenderDisabled(allNoGender);
                    if (allNoGender) setSelectedGender("");
                }
            } catch (err) {
                console.error("Failed loading subcategories", err);
            }
        }
        loadSubcategories();
    }, [selectedGender, selectedCategory, genders]);

    // When category changes → reload sizes filtered by category
    useEffect(() => {
        async function loadSizes() {
            if (!selectedCategory) {
                setSizes([]);
                return;
            }
            try {
                const res = await fetch(`/api/sizes?category=${selectedCategory}`);
                if (res.ok) setSizes(await res.json());
            } catch (err) {
                console.error("Failed loading sizes", err);
            }
        }
        loadSizes();
    }, [selectedCategory]);

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files ? Array.from(e.target.files) : [];
        setImages(files);
        preview.forEach(url => URL.revokeObjectURL(url));
        setPreview(files.map(f => URL.createObjectURL(f)));
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const form = e.currentTarget;
        const formData = new FormData(form);
        images.forEach((img) => formData.append("images", img));

        // Remove size if empty (optional field)
        if (!selectedSize) formData.delete("size");
        else formData.set("size", selectedSize);
        formData.set("condition", selectedCondition);
        formData.set("color", selectedColor);
        formData.set("material", selectedMaterial);

        try {
            const res = await api("/api/products", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (data.requiresStripe) {
                const stripeRes = await api("/api/stripe/connect", { method: "POST" });
                const stripeData = await stripeRes.json();
                window.location.href = stripeData.url;
                return;
            }

            if (!res.ok) {
                alert("Error: " + (data.error || "Could not create product"));
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

    const displayName = (item: DropdownItem) => item.name || item.label || item.value || "";

    // Helper to map dropdown data to CustomDropdown format
    const mapOptions = (arr: DropdownItem[]) => arr.map(o => ({ _id: o._id, label: displayName(o) }));

    // Luk dropdown hvis klik udenfor
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (brandInputRef.current && !brandInputRef.current.contains(e.target as Node)) {
                setShowBrandDropdown(false);
            }
        }
        if (showBrandDropdown) {
            document.addEventListener("mousedown", handleClick);
        } else {
            document.removeEventListener("mousedown", handleClick);
        }
        return () => document.removeEventListener("mousedown", handleClick);
    }, [showBrandDropdown]);

    return (
        <div className="max-w-3xl mx-auto p-8 bg-ivory-dark shadow-2xl mt-10 mb-32 rounded-2xl text-racing-green">
            <h1 className="text-3xl font-serif font-bold mb-8 border-b border-racing-green/20 pb-4">Create Product</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                    <label className="block font-semibold mb-1 uppercase text-xs tracking-wider">Title</label>
                    <input name="title" required className="w-full p-3 bg-ivory border border-racing-green/20 rounded-lg focus:ring-2 focus:ring-racing-green focus:outline-none text-black" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Gender — drives subcategory filtering */}
                    <div>
                        <label className="block font-semibold mb-1 uppercase text-xs tracking-wider">Gender</label>
                        <CustomDropdown
                            options={mapOptions(genders)}
                            value={selectedGender}
                            onChange={setSelectedGender}
                            placeholder="Select gender"
                            name="gender"
                            required={!isGenderDisabled}
                            disabled={isGenderDisabled}
                        />
                    </div>

                    {/* Category — drives size filtering */}
                    <div>
                        <label className="block font-semibold mb-1 uppercase text-xs tracking-wider">Category</label>
                        <CustomDropdown
                            options={mapOptions(categories)}
                            value={selectedCategory}
                            onChange={setSelectedCategory}
                            placeholder="Select category"
                            name="category"
                            required
                        />
                    </div>

                    {/* Subcategory — filtered by selected gender + category */}
                    <div>
                        <label className="block font-semibold mb-1 uppercase text-xs tracking-wider">Subcategory</label>
                        <CustomDropdown
                            options={mapOptions(subcategories)}
                            value={""}
                            onChange={() => {}}
                            placeholder={!selectedCategory
                                ? "Select category first"
                                : subcategories.length === 0
                                    ? "No subcategories available"
                                    : "Select subcategory"}
                            name="subcategory"
                            required
                            disabled={!selectedCategory || subcategories.length === 0}
                        />
                    </div>

                    {/* Brand - custom søgbar dropdown */}
                    <div>
                        <label className="block font-semibold mb-1 uppercase text-xs tracking-wider">Brand</label>
                        <CustomDropdown
                            options={mapOptions(brands)}
                            value={selectedBrand}
                            onChange={setSelectedBrand}
                            placeholder="Select brand"
                            name="brand"
                            required
                            searchable
                        />
                    </div>

                    {/* Size — optional, filtered by selected category */}
                    <div>
                        <label className="block font-semibold mb-1 uppercase text-xs tracking-wider">Size <span className="text-racing-green/50 normal-case">(optional)</span></label>
                        <CustomDropdown
                            options={mapOptions(sizes)}
                            value={selectedSize}
                            onChange={setSelectedSize}
                            placeholder={selectedCategory ? (sizes.length === 0 ? "No sizes for this category" : "Select size") : "Select category first"}
                            name="size"
                            required={false}
                            disabled={!selectedCategory || sizes.length === 0}
                        />
                    </div>

                    {/* Condition */}
                    <div>
                        <label className="block font-semibold mb-1 uppercase text-xs tracking-wider">Condition</label>
                        <CustomDropdown
                            options={mapOptions(conditions)}
                            value={selectedCondition}
                            onChange={setSelectedCondition}
                            placeholder="Select condition"
                            name="condition"
                            required
                        />
                    </div>

                    {/* Color */}
                    <div>
                        <label className="block font-semibold mb-1 uppercase text-xs tracking-wider">Color</label>
                        <CustomDropdown
                            options={mapOptions(colors)}
                            value={selectedColor}
                            onChange={setSelectedColor}
                            placeholder="Select color"
                            name="color"
                            required
                        />
                    </div>

                    {/* Material */}
                    <div>
                        <label className="block font-semibold mb-1 uppercase text-xs tracking-wider">Material</label>
                        <CustomDropdown
                            options={mapOptions(materials)}
                            value={selectedMaterial}
                            onChange={setSelectedMaterial}
                            placeholder="Select material"
                            name="material"
                            required
                        />
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block font-semibold mb-1 uppercase text-xs tracking-wider">Tags</label>
                        <select
                            name="tags"
                            multiple
                            required
                            className="w-full p-3 bg-ivory border border-racing-green/20 rounded-lg focus:ring-2 focus:ring-racing-green focus:outline-none text-black min-h-[48px]"
                        >
                            {tags.map(t => (
                                <option key={t._id} value={t._id}>{displayName(t)}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Price */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block font-semibold mb-1 uppercase text-xs tracking-wider">Price (DKK)</label>
                        <input type="number" name="price" required className="w-full p-3 bg-ivory border border-racing-green/20 rounded-lg focus:ring-2 focus:ring-racing-green focus:outline-none text-black" />
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block font-semibold mb-1 uppercase text-xs tracking-wider">Description</label>
                    <textarea name="description" required className="w-full p-3 bg-ivory border border-racing-green/20 rounded-lg focus:ring-2 focus:ring-racing-green focus:outline-none h-32 text-black" />
                </div>

                {/* Images */}
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
                                    <img src={src} className="w-24 h-24 object-cover rounded-lg border-2 border-racing-green/10 shadow-md transition-transform group-hover:scale-105" alt="Preview" />
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