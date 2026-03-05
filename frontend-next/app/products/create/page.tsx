'use client';
import { useEffect, useState, useRef } from "react";
import { api } from "@/app/api/api";
import CustomDropdown from "@/app/components/UI/CustomDropdown";
import { AlertCircle, Package, Loader2, CheckCircle2 } from "lucide-react";

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

    // Form States
    const [selectedGender, setSelectedGender] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSubcategory, setSelectedSubcategory] = useState("");
    const [selectedBrand, setSelectedBrand] = useState("");
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedCondition, setSelectedCondition] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [selectedMaterial, setSelectedMaterial] = useState("");

    // Fragt og vægt (vigtigt for store varer)
    const [isLargeItem, setIsLargeItem] = useState(false);
    const [weight, setWeight] = useState<number>(1000);

    const [images, setImages] = useState<File[]>([]);
    const [preview, setPreview] = useState<string[]>([]);
    const [loadingForm, setLoading] = useState(false);
    const [isGenderDisabled, setIsGenderDisabled] = useState(false);

    // Load static data
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

    // ⭐ Fix for borde/møbler: Deaktiver køn og tænd for "Large Item"
    useEffect(() => {
        const categoryObj = categories.find(c => c._id === selectedCategory);
        const name = (categoryObj?.name || categoryObj?.label || "").toLowerCase();

        if (name === 'furniture' || name === 'møbler' || name === 'home' || name === 'interior') {
            setIsGenderDisabled(true);
            setSelectedGender("");
            setIsLargeItem(true);
        } else {
            setIsGenderDisabled(false);
        }
    }, [selectedCategory, categories]);

    // Filter subcategories
    useEffect(() => {
        async function loadSubcategories() {
            if (!selectedCategory) {
                setSubcategories([]);
                return;
            }
            try {
                const genderItem = genders.find(g => g._id === selectedGender);
                const genderName = genderItem?.name || "";
                let url = `/api/subcategories?category=${selectedCategory}`;
                if (genderName) url += `&gender=${encodeURIComponent(genderName)}`;
                const res = await fetch(url);
                if (res.ok) setSubcategories(await res.json());
            } catch (err) {}
        }
        loadSubcategories();
    }, [selectedGender, selectedCategory, genders]);

    // Filter sizes
    useEffect(() => {
        async function loadSizes() {
            if (!selectedCategory) {
                setSizes([]);
                return;
            }
            try {
                const res = await fetch(`/api/sizes?category=${selectedCategory}`);
                if (res.ok) setSizes(await res.json());
            } catch (err) {}
        }
        loadSizes();
    }, [selectedCategory]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        setImages(files);
        setPreview(files.map(f => URL.createObjectURL(f)));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // ⭐ Fallback køn hvis feltet er deaktiveret (fx bord)
        let finalGender = selectedGender;
        if (isGenderDisabled) {
            const fallback = genders.find(g =>
                ["unisex", "none", "alle", "other"].some(word => g.name?.toLowerCase().includes(word))
            );
            if (fallback) finalGender = fallback._id;
        }

        // ⭐ Validering før afsendelse
        if (!selectedCategory || !selectedSubcategory || !selectedBrand || !selectedCondition || !selectedColor || !selectedMaterial || !finalGender) {
            alert("Please fill out all required fields marked with *");
            return;
        }

        setLoading(true);
        const form = e.currentTarget;
        const formData = new FormData(form);

        // Ryd op i de automatiske felter så vi sender vores state-id'er rent
        ["category", "subcategory", "brand", "gender", "condition", "color", "material", "size"].forEach(f => formData.delete(f));
        images.forEach((img) => formData.append("images", img));

        // Sæt de korrekte værdier
        formData.set("category", selectedCategory);
        formData.set("subcategory", selectedSubcategory);
        formData.set("brand", selectedBrand);
        formData.set("gender", finalGender);
        formData.set("condition", selectedCondition);
        formData.set("color", selectedColor);
        formData.set("material", selectedMaterial);
        if (selectedSize) formData.set("size", selectedSize);

        formData.set("isLargeItem", String(isLargeItem));
        formData.set("weight", String(weight));

        try {
            const res = await api("/api/products", { method: "POST", body: formData });
            const data = await res.json();

            if (!res.ok) {
                alert("Error: " + (data.error || data.message));
                setLoading(false);
                return;
            }

            if (data.requiresStripe) {
                const stripeRes = await api("/api/stripe/connect", { method: "POST" });
                const stripeData = await stripeRes.json();
                window.location.href = stripeData.url;
                return;
            }

            alert("Product published!");
            window.location.reload();
        } catch (error) {
            alert("A server error occurred.");
            setLoading(false);
        }
    };

    const mapOptions = (arr: DropdownItem[]) => arr.map(o => ({ _id: o._id, label: o.name || o.label || o.value || "" }));

    return (
        <div className="max-w-3xl mx-auto p-8 bg-ivory-dark shadow-2xl mt-10 mb-32 rounded-[2rem] text-racing-green">
            <h1 className="text-3xl font-serif font-black mb-8 border-b border-racing-green/10 pb-4 italic uppercase tracking-tight">Create Listing</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                    <label className="block font-bold mb-1 uppercase text-[10px] tracking-widest opacity-60">Title *</label>
                    <input name="title" required className="w-full p-4 bg-ivory border border-racing-green/10 rounded-xl focus:ring-2 focus:ring-racing-green focus:outline-none text-black font-medium" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Category */}
                    <div>
                        <label className="block font-bold mb-1 uppercase text-[10px] tracking-widest opacity-60">Category *</label>
                        <CustomDropdown options={mapOptions(categories)} value={selectedCategory} onChange={setSelectedCategory} placeholder="Select category" />
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="block font-bold mb-1 uppercase text-[10px] tracking-widest opacity-60">Gender {isGenderDisabled ? '(N/A)' : '*'}</label>
                        <CustomDropdown options={mapOptions(genders)} value={selectedGender} onChange={setSelectedGender} placeholder={isGenderDisabled ? "Not applicable" : "Select gender"} disabled={isGenderDisabled} />
                    </div>

                    {/* Subcategory */}
                    <div>
                        <label className="block font-bold mb-1 uppercase text-[10px] tracking-widest opacity-60">Subcategory *</label>
                        <CustomDropdown options={mapOptions(subcategories)} value={selectedSubcategory} onChange={setSelectedSubcategory} placeholder="Select subcategory" disabled={!selectedCategory} />
                    </div>

                    {/* Brand */}
                    <div>
                        <label className="block font-bold mb-1 uppercase text-[10px] tracking-widest opacity-60">Brand *</label>
                        <CustomDropdown options={mapOptions(brands)} value={selectedBrand} onChange={setSelectedBrand} placeholder="Search brand" searchable />
                    </div>
                </div>

                {/* Shipping & Weight (Din vigtige nye sektion) */}
                <div className="bg-racing-green/[0.03] p-6 rounded-2xl border border-racing-green/10 space-y-6">
                    <div className="flex items-center gap-2">
                        <Package size={16} className="text-racing-green" />
                        <h3 className="font-black uppercase text-[10px] tracking-[0.2em]">Shipping & Dimensions</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block font-bold mb-1 uppercase text-[9px] tracking-widest opacity-50">Weight (grams) *</label>
                            <input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} required className="w-full p-3 bg-ivory border border-racing-green/10 rounded-xl text-black font-mono text-sm" />
                        </div>
                        <div className="flex items-center">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" className="sr-only" checked={isLargeItem} onChange={(e) => setIsLargeItem(e.target.checked)} />
                                <div className={`w-10 h-6 rounded-full transition-colors ${isLargeItem ? 'bg-racing-green' : 'bg-gray-300'}`}></div>
                                <span className="font-bold uppercase text-[10px] tracking-widest ml-2">Oversized / Furniture</span>
                            </label>
                        </div>
                    </div>
                    {isLargeItem && (
                        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                            <AlertCircle className="text-amber-600 shrink-0" size={18} />
                            <p className="text-[10px] text-amber-900 leading-relaxed uppercase font-bold tracking-tight">
                                Large item: Standard shipping is disabled. Pickup or manual delivery only.
                            </p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block font-bold mb-1 uppercase text-[10px] tracking-widest opacity-60">Condition *</label>
                        <CustomDropdown options={mapOptions(conditions)} value={selectedCondition} onChange={setSelectedCondition} placeholder="Select condition" />
                    </div>
                    <div>
                        <label className="block font-bold mb-1 uppercase text-[10px] tracking-widest opacity-60">Color *</label>
                        <CustomDropdown options={mapOptions(colors)} value={selectedColor} onChange={setSelectedColor} placeholder="Select color" />
                    </div>
                    <div>
                        <label className="block font-bold mb-1 uppercase text-[10px] tracking-widest opacity-60">Material *</label>
                        <CustomDropdown options={mapOptions(materials)} value={selectedMaterial} onChange={setSelectedMaterial} placeholder="Select material" />
                    </div>
                    <div>
                        <label className="block font-bold mb-1 uppercase text-[10px] tracking-widest opacity-60">Size (Optional)</label>
                        <CustomDropdown options={mapOptions(sizes)} value={selectedSize} onChange={setSelectedSize} placeholder="Select size" disabled={!selectedCategory || sizes.length === 0} />
                    </div>
                </div>

                {/* Price & Description */}
                <div>
                    <label className="block font-bold mb-1 uppercase text-[10px] tracking-widest opacity-60">Price (DKK) *</label>
                    <input type="number" name="price" required className="w-full p-4 bg-ivory border border-racing-green/10 rounded-2xl text-2xl font-black text-black" />
                </div>

                <div>
                    <label className="block font-bold mb-1 uppercase text-[10px] tracking-widest opacity-60">Description *</label>
                    <textarea name="description" required className="w-full p-4 bg-ivory border border-racing-green/10 rounded-2xl h-32 text-black" />
                </div>

                {/* Images */}
                <div className="bg-ivory/50 p-6 rounded-2xl border border-dashed border-racing-green/20">
                    <label className="block font-bold mb-4 uppercase text-[10px] tracking-widest opacity-60">Images *</label>
                    <input type="file" multiple accept="image/*" onChange={handleImageChange} className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-6 file:rounded-full file:bg-racing-green file:text-ivory file:font-black file:uppercase cursor-pointer" />
                    <div className="flex gap-4 mt-6 flex-wrap">
                        {preview.map((src, i) => (
                            <img key={i} src={src} className="w-20 h-20 object-cover rounded-xl border border-racing-green/10" alt="Preview" />
                        ))}
                    </div>
                </div>

                <button type="submit" disabled={loadingForm} className="w-full bg-racing-green text-ivory py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-xs shadow-xl active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                    {loadingForm ? <Loader2 className="animate-spin" size={16} /> : <><CheckCircle2 size={16} /> Publish Product</>}
                </button>
            </form>
        </div>
    );
}