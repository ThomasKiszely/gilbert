"use client";

import { useEffect, useState, useCallback } from "react";
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
}

// ─── Hjælpe-komponent: Checkbox gruppe ───────────────────────────────────────

function CheckboxGroup({
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
}) {
    const [open, setOpen] = useState(true);

    return (
        <div className="border-b border-border/30 pb-4 mb-4">
            <button
                className="flex w-full items-center justify-between text-sm font-semibold uppercase tracking-wider text-foreground/70 mb-3"
                onClick={() => setOpen((v) => !v)}
            >
                {title}
                <span className="text-xs">{open ? "▲" : "▼"}</span>
            </button>

            {open && (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {options.map((opt) => {
                        const label = opt[labelKey] ?? opt.name ?? opt.label ?? "";
                        return (
                            <label
                                key={opt._id}
                                className="flex items-center gap-2 cursor-pointer group"
                            >
                                <input
                                    type="checkbox"
                                    checked={selected.includes(opt._id)}
                                    onChange={() => onToggle(opt._id)}
                                    className="accent-foreground w-4 h-4 rounded border border-border cursor-pointer"
                                />
                                {opt.hex && (
                                    <span
                                        className="w-4 h-4 rounded-full border border-border/50 inline-block shrink-0"
                                        style={{ backgroundColor: opt.hex }}
                                    />
                                )}
                                <span className="text-sm text-foreground/70 group-hover:text-foreground transition-colors">
                                    {label}
                                </span>
                            </label>
                        );
                    })}
                    {options.length === 0 && (
                        <p className="text-xs text-muted-foreground italic">Ingen muligheder</p>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Hoved-komponent ─────────────────────────────────────────────────────────

export default function FilterSidebar({ filters, onChange, mobileOpen = false, onClose }: Props) {
    const [brands, setBrands] = useState<FilterOption[]>([]);
    const [conditions, setConditions] = useState<FilterOption[]>([]);
    const [sizes, setSizes] = useState<FilterOption[]>([]);
    const [colors, setColors] = useState<FilterOption[]>([]);
    const [materials, setMaterials] = useState<FilterOption[]>([]);

    // Lås scroll på body når drawer er åben på mobil
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [mobileOpen]);



    useEffect(() => {
        const fetchOptions = async () => {
            const [b, cond, s, col, mat] = await Promise.all([
                api("/api/brands").then((r) => r.json()),
                api("/api/conditions").then((r) => r.json()),
                api("/api/sizes").then((r) => r.json()),
                api("/api/colors").then((r) => r.json()),
                api("/api/materials").then((r) => r.json()),
            ]);
            setBrands(b);
            setConditions(cond);
            setSizes(s);
            setColors(col);
            setMaterials(mat);
        };
        fetchOptions();
    }, []);

    const toggle = useCallback(
        (key: keyof ActiveFilters, id: string) => {
            const current = filters[key] as string[];
            const next = current.includes(id)
                ? current.filter((x) => x !== id)
                : [...current, id];
            onChange({ ...filters, [key]: next });
        },
        [filters, onChange]
    );

    const activeCount =
        filters.brands.length +
        filters.conditions.length +
        filters.sizes.length +
        filters.colors.length +
        filters.materials.length +
        (filters.priceMin ? 1 : 0) +
        (filters.priceMax ? 1 : 0);

    // ─── Indhold (delt mellem desktop og mobil) ───────────────────────────────
    const buildContent = (instanceId: string) => (
        <>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                    Filter
                </h2>
                <div className="flex items-center gap-3">
                    {activeCount > 0 && (
                        <button
                            onClick={() =>
                                onChange({
                                    sort: filters.sort,
                                    brands: [],
                                    conditions: [],
                                    sizes: [],
                                    colors: [],
                                    materials: [],
                                    priceMin: "",
                                    priceMax: "",
                                })
                            }
                            className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
                        >
                            Nulstil ({activeCount})
                        </button>
                    )}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="md:hidden p-1 rounded-md text-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
                            aria-label="Luk filter"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Sortering */}
            <div className="border-b border-border/30 pb-4 mb-4">
                <p className="text-sm font-semibold uppercase tracking-wider text-foreground/70 mb-3">
                    Sortering
                </p>
                <div className="space-y-2">
                    {[
                        { value: "newest", label: "Nyeste først" },
                        { value: "price_asc", label: "Pris: lav til høj" },
                        { value: "price_desc", label: "Pris: høj til lav" },
                    ].map((opt) => (
                        <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                name={`sort-${instanceId}`}
                                value={opt.value}
                                checked={filters.sort === opt.value}
                                onChange={() => onChange({ ...filters, sort: opt.value })}
                                className="accent-foreground cursor-pointer"
                            />
                            <span className="text-sm text-foreground/70 group-hover:text-foreground transition-colors">
                                {opt.label}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Pris range */}
            <div className="border-b border-border/30 pb-4 mb-4">
                <p className="text-sm font-semibold uppercase tracking-wider text-foreground/70 mb-3">
                    Pris (DKK)
                </p>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        placeholder="Min"
                        value={filters.priceMin}
                        min={0}
                        onChange={(e) => onChange({ ...filters, priceMin: e.target.value })}
                        className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30"
                    />
                    <span className="text-muted-foreground text-sm">–</span>
                    <input
                        type="number"
                        placeholder="Max"
                        value={filters.priceMax}
                        min={0}
                        onChange={(e) => onChange({ ...filters, priceMax: e.target.value })}
                        className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30"
                    />
                </div>
            </div>

            <CheckboxGroup title="Designer" options={brands} selected={filters.brands} onToggle={(id) => toggle("brands", id)} />
            <CheckboxGroup title="Stand" options={conditions} selected={filters.conditions} onToggle={(id) => toggle("conditions", id)} />
            <CheckboxGroup title="Størrelse" options={sizes} selected={filters.sizes} labelKey="label" onToggle={(id) => toggle("sizes", id)} />
            <CheckboxGroup title="Farve" options={colors} selected={filters.colors} onToggle={(id) => toggle("colors", id)} />
            <CheckboxGroup title="Materiale" options={materials} selected={filters.materials} onToggle={(id) => toggle("materials", id)} />

            {/* Vis resultater knap — kun mobil */}
            {onClose && (
                <div className="pt-2 pb-4 md:hidden">
                    <button
                        onClick={onClose}
                        className="w-full rounded-lg bg-foreground text-background py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                        Vis resultater
                    </button>
                </div>
            )}
        </>
    );

    return (
        <>
            {/* ── Desktop sidebar (skjult på mobil) ── */}
            <aside className="hidden md:block w-64 shrink-0 sticky top-24 self-start">
                {buildContent("desktop")}
            </aside>

            {/* ── Mobil: backdrop overlay ── */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
                    onClick={onClose}
                />
            )}

            {/* ── Mobil: slide-in drawer fra venstre ── */}
            <div
                className={`
                    fixed top-0 left-0 z-50 h-full w-80 max-w-[85vw]
                    bg-background shadow-2xl
                    transform transition-transform duration-300 ease-in-out
                    md:hidden
                    overflow-y-auto
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                <div className="p-5">
                    {buildContent("mobile")}
                </div>
            </div>
        </>
    );
}
