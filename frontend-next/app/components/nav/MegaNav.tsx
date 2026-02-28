"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { navLinks } from "./navLinks";
import { api } from "@/app/api/api";

type SubcategoryItem = {
    id: string;
    name: string;
};

type CategoryTree = Record<string, SubcategoryItem[]>;

type Brand = {
    _id: string;
    name: string;
};

const GENDER_MAP: Record<string, string> = {
    Men: "Male",
    Women: "Female",
};

const BRANDS_PREVIEW = 15;

export default function MegaNav() {
    const [hovered, setHovered] = useState<string | null>(null);
    const [tree, setTree] = useState<CategoryTree | null>(null);
    const [treeError, setTreeError] = useState(false);
    const [brands, setBrands] = useState<Brand[]>([]);

    useEffect(() => {
        const fetchTree = async () => {
            try {
                const res = await api(`/api/categories/full`);
                const data = await res.json();
                setTree(data);
            } catch {
                setTreeError(true);
                setTree({});
            }
        };
        fetchTree();
    }, []);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const res = await api(`/api/brands`);
                const data: Brand[] = await res.json();
                setBrands(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchBrands();
    }, []);

    return (
        <nav className="bg-background border-b border-border/50">
            <div className="flex items-center justify-center gap-1 px-4 py-2 min-w-max mx-auto">
                {navLinks.map((link) => {
                    const isGender = link.label in GENDER_MAP;
                    const isBrands = link.label === "Brands";

                    return (
                        <div
                            key={link.label}
                            className="relative group"
                            onMouseEnter={() => setHovered(link.label)}
                            onMouseLeave={() => setHovered(null)}
                        >
                            <Link
                                href={link.href}
                                className={`text-xs md:text-sm whitespace-nowrap px-3 py-1 transition-colors inline-block ${
                                    link.highlight
                                        ? "text-accent font-semibold hover:text-burgundy-light"
                                        : "text-foreground/70 hover:text-foreground"
                                }`}
                            >
                                {link.label}
                            </Link>

                            {/* ── Gender megamenu ── */}
                            {isGender && hovered === link.label && (
                                <>
                                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-full h-2" />
                                    <div className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+0.5rem)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-out z-50">
                                        <div className="w-3 h-3 bg-popover border-l border-t border-border/50 rotate-45 mx-auto -mb-1.5 relative z-10" />
                                        <div className="bg-popover border border-border/50 rounded-lg shadow-xl p-6 min-w-[28rem]">
                                            {tree === null ? (
                                                <p className="text-sm text-muted-foreground">Indlæser kategorier…</p>
                                            ) : treeError || Object.keys(tree).length === 0 ? (
                                                <p className="text-sm text-muted-foreground">Ingen kategorier fundet.</p>
                                            ) : (
                                                <div className="flex gap-8">
                                                    {Object.entries(tree).map(([category, subs]) => (
                                                        <div key={`cat-${category}`} className="min-w-[8rem]">
                                                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 font-sans">
                                                                {category}
                                                            </h4>
                                                            <ul className="space-y-2">
                                                                {Array.isArray(subs) && subs.length === 0 ? (
                                                                    <li className="text-xs text-muted-foreground/60 italic">Ingen underkategorier</li>
                                                                ) : (
                                                                    subs.map((sub) => (
                                                                        <li key={sub.id}>
                                                                            <Link
                                                                                href={`/products/filter?gender=${GENDER_MAP[link.label]}&subcategory=${sub.id}`}
                                                                                className="text-sm text-foreground/70 hover:text-foreground flex items-center gap-1 group/item transition-colors"
                                                                            >
                                                                                <span>{sub.name}</span>
                                                                                <svg className="h-3 w-3 opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-150" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                                                    <path d="M9 5l7 7-7 7" />
                                                                                </svg>
                                                                            </Link>
                                                                        </li>
                                                                    ))
                                                                )}
                                                            </ul>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="mt-5 pt-4 border-t border-border/30">
                                                <Link
                                                    href={`/products/filter?gender=${GENDER_MAP[link.label]}`}
                                                    className="text-xs font-medium text-foreground/60 hover:text-foreground transition-colors uppercase tracking-wider"
                                                >
                                                    Se alt i {link.label} →
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* ── Brands megamenu ── */}
                            {isBrands && hovered === link.label && (
                                <>
                                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-full h-2" />
                                    <div className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+0.5rem)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-out z-50">
                                        <div className="w-3 h-3 bg-popover border-l border-t border-border/50 rotate-45 mx-auto -mb-1.5 relative z-10" />
                                        <div className="bg-popover border border-border/50 rounded-lg shadow-xl p-6 w-[36rem]">
                                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                                                Populære brands
                                            </h4>

                                            {brands.length === 0 ? (
                                                <p className="text-sm text-muted-foreground">Indlæser brands…</p>
                                            ) : (
                                                <div className="grid grid-cols-3 gap-x-6 gap-y-2">
                                                    {brands.slice(0, BRANDS_PREVIEW).map((brand) => (
                                                        <Link
                                                            key={brand._id}
                                                            href={`/products/filter?brands=${brand._id}`}
                                                            className="text-sm text-foreground/70 hover:text-foreground truncate transition-colors py-0.5"
                                                        >
                                                            {brand.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="mt-5 pt-4 border-t border-border/30">
                                                <Link
                                                    href="/brands"
                                                    className="text-xs font-medium text-foreground/60 hover:text-foreground transition-colors uppercase tracking-wider"
                                                >
                                                    Se alle brands ({brands.length}) →
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </nav>
    );
}
