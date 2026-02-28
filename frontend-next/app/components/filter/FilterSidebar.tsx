"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { api } from "@/app/api/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FilterOption {
    _id: string;
    name?: string;
    label?: string;
    hex?: string;
}

export interface ActiveFilters {
    sort: string;
    brands: string[];
    conditions: string[];
    sizes: string[];
    colors: string[];
    materials: string[];
    priceMin: string;
    priceMax: string;
}

interface Props {
    filters: ActiveFilters;
    onChange: (filters: ActiveFilters) => void;
    mobileOpen?: boolean;
    onClose?: () => void;
    hideBrands?: boolean;
}

// ─── Hjælpe-komponent: Checkbox gruppe (Memoized) ───────────────────────────────
const CheckboxGroup = ({
                           title,
                           options,
                           selected,
                           labelKey = "name",
                           onToggle,
                       }: {
    title: string;
    options: FilterOption[];
    selected: string[];
    labelKey?: "name" | "label";
    onToggle: (id: string) => void;
}) => {
    const [open, setOpen] = useState(true);
    if (options.length === 0) return null;

    return (
        <div className="border-b border-border/30 pb-4 mb-4">
            <button
                className="flex w-full items-center justify-between text-[11px] font-bold uppercase tracking-widest text-foreground/50 mb-3 hover:text-foreground transition-colors"
                onClick={() => setOpen(!open)}
            >
                {title}
                <span className={`transition-transform duration-200 ${open ? "" : "rotate-180"}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
            </button>
            {open && (
                <div className="space-y-2.5 max-h-52 overflow-y-auto pr-2 custom-scrollbar">
                    {options.map((opt) => (
                        <label key={opt._id} className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center justify-center">
                                <input
                                    type="checkbox"
                                    checked={selected.includes(opt._id)}
                                    onChange={() => onToggle(opt._id)}
                                    className="peer h-4 w-4 border-border rounded appearance-none border checked:bg-foreground checked:border-foreground transition-all cursor-pointer"
                                />
                                <svg className="absolute w-2.5 h-2.5 text-background pointer-events-none hidden peer-checked:block" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                            </div>
                            {opt.hex && (
                                <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: opt.hex }} />
                            )}
                            <span className="text-sm text-foreground/70 group-hover:text-foreground transition-colors">
                                {opt[labelKey] ?? opt.name}
                            </span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── Hoved-komponent ─────────────────────────────────────────────────────────
export default function FilterSidebar({ filters, onChange, mobileOpen = false, onClose, hideBrands = false }: Props) {
    const [data, setData] = useState<{ [key: string]: FilterOption[] }>({
        brands: [], conditions: [], sizes: [], colors: [], materials: []
    });
    const [loading, setLoading] = useState(true);

    // Lokale pris-states for at undgå "stutter" i UI ved indtastning (Debounce)
    const [localPrice, setLocalPrice] = useState({ min: filters.priceMin, max: filters.priceMax });

    useEffect(() => {
        setLocalPrice({ min: filters.priceMin, max: filters.priceMax });
    }, [filters.priceMin, filters.priceMax]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localPrice.min !== filters.priceMin || localPrice.max !== filters.priceMax) {
                onChange({ ...filters, priceMin: localPrice.min, priceMax: localPrice.max });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [localPrice, onChange, filters]);

    // Lås scroll
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
    }, [mobileOpen]);

    // Hent alle filter-data på én gang
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [b, cond, s, col, mat] = await Promise.all([
                    api("/api/brands").then(r => r.json()),
                    api("/api/conditions").then(r => r.json()),
                    api("/api/sizes").then(r => r.json()),
                    api("/api/colors").then(r => r.json()),
                    api("/api/materials").then(r => r.json()),
                ]);
                setData({ brands: b, conditions: cond, sizes: s, colors: col, materials: mat });
            } catch (err) {
                console.error("Kunne ikke hente filtre", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const toggle = useCallback((key: keyof ActiveFilters, id: string) => {
        const current = filters[key] as string[];
        const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
        onChange({ ...filters, [key]: next });
    }, [filters, onChange]);

    const activeCount = useMemo(() => (
        filters.brands.length + filters.conditions.length + filters.sizes.length +
        filters.colors.length + filters.materials.length +
        (filters.priceMin ? 1 : 0) + (filters.priceMax ? 1 : 0)
    ), [filters]);

    const buildContent = (instanceId: string) => (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-bold uppercase tracking-[0.15em]">Filtre</h2>
                <div className="flex items-center gap-4">
                    {activeCount > 0 && (
                        <button
                            onClick={() => onChange({ ...filters, brands: [], conditions: [], sizes: [], colors: [], materials: [], priceMin: "", priceMax: "" })}
                            className="text-[11px] font-medium text-muted-foreground hover:text-foreground underline underline-offset-4"
                        >
                            Nulstil
                        </button>
                    )}
                    {onClose && (
                        <button onClick={onClose} className="md:hidden p-1">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="space-y-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />)}
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {/* Sortering */}
                    <div className="border-b border-border/30 pb-6 mb-6">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/50 mb-4">Sorter efter</p>
                        <div className="grid grid-cols-1 gap-2">
                            {[
                                { value: "newest", label: "Nyeste ankommet" },
                                { value: "price_asc", label: "Pris: Lav til Høj" },
                                { value: "price_desc", label: "Pris: Høj til Lav" },
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => onChange({ ...filters, sort: opt.value })}
                                    className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${filters.sort === opt.value ? "bg-foreground text-background font-medium" : "bg-muted/50 text-foreground/70 hover:bg-muted"}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Pris */}
                    <div className="border-b border-border/30 pb-6 mb-6">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/50 mb-4">Pris (DKK)</p>
                        <div className="flex items-center gap-2">
                            <input
                                type="number" placeholder="Min"
                                value={localPrice.min}
                                onChange={(e) => setLocalPrice(prev => ({ ...prev, min: e.target.value }))}
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-foreground outline-none transition-all"
                            />
                            <div className="h-[1px] w-4 bg-border" />
                            <input
                                type="number" placeholder="Max"
                                value={localPrice.max}
                                onChange={(e) => setLocalPrice(prev => ({ ...prev, max: e.target.value }))}
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-foreground outline-none transition-all"
                            />
                        </div>
                    </div>

                    {!hideBrands && <CheckboxGroup title="Brands" options={data.brands} selected={filters.brands} onToggle={(id) => toggle("brands", id)} />}
                    <CheckboxGroup title="Stand" options={data.conditions} selected={filters.conditions} onToggle={(id) => toggle("conditions", id)} />
                    <CheckboxGroup title="Størrelser" options={data.sizes} selected={filters.sizes} labelKey="label" onToggle={(id) => toggle("sizes", id)} />
                    <CheckboxGroup title="Farver" options={data.colors} selected={filters.colors} onToggle={(id) => toggle("colors", id)} />
                    <CheckboxGroup title="Materialer" options={data.materials} selected={filters.materials} onToggle={(id) => toggle("materials", id)} />
                </div>
            )}

            {onClose && (
                <div className="mt-auto pt-4 md:hidden">
                    <button onClick={onClose} className="w-full bg-foreground text-background py-4 rounded-xl font-bold text-sm tracking-wide shadow-lg active:scale-[0.98] transition-transform">
                        VIS RESULTATER
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <>
            <aside className="hidden md:block w-64 shrink-0 sticky top-24 self-start max-h-[calc(100vh-120px)]">
                {buildContent("desktop")}
            </aside>

            {/* Mobil Drawer */}
            <div className={`fixed inset-0 z-[100] md:hidden transition-opacity duration-300 ${mobileOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
                <div className={`absolute bottom-0 left-0 right-0 top-0 w-full max-w-[340px] bg-background p-6 transition-transform duration-300 ease-out ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
                    {buildContent("mobile")}
                </div>
            </div>
        </>
    );
}