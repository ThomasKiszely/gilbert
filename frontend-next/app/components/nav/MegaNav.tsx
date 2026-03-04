"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

// Kategorier der skal være selvstændige menuer
const SOLO_CATEGORIES = ["Home", "Beauty"];

export default function MegaNav() {
    const [hovered, setHovered] = useState<string | null>(null);
    const [genderTrees, setGenderTrees] = useState<Record<string, CategoryTree>>({});
    const [soloTrees, setSoloTrees] = useState<Record<string, CategoryTree>>({});
    const [treeError, setTreeError] = useState(false);
    const [brands, setBrands] = useState<Brand[]>([]);
    const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const navRef = useRef<HTMLElement>(null);
    const pathname = usePathname();
    const prevPathname = useRef(pathname);
    const isTouching = useRef(false);

    // Luk dropdown ved route-skifte
    useEffect(() => {
        if (prevPathname.current !== pathname) {
            prevPathname.current = pathname;
            queueMicrotask(() => setHovered(null));
        }
    }, [pathname]);

    // Luk dropdown ved klik udenfor
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (navRef.current && !navRef.current.contains(e.target as Node)) {
                setHovered(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Registrer touch-events for at undgå at hover-handlers fyrer på touch
    useEffect(() => {
        function onTouchStart() { isTouching.current = true; }
        function onTouchEnd() {
            // Reset efter kort delay så mouseenter der følger efter touch ignoreres
            setTimeout(() => { isTouching.current = false; }, 300);
        }
        document.addEventListener("touchstart", onTouchStart, { passive: true });
        document.addEventListener("touchend", onTouchEnd, { passive: true });
        return () => {
            document.removeEventListener("touchstart", onTouchStart);
            document.removeEventListener("touchend", onTouchEnd);
        };
    }, []);

    const handleEnter = (label: string) => {
        if (isTouching.current) return;
        if (closeTimeout.current) {
            clearTimeout(closeTimeout.current);
            closeTimeout.current = null;
        }
        setHovered(label);
    };

    const handleLeave = () => {
        if (isTouching.current) return;
        closeTimeout.current = setTimeout(() => {
            setHovered(null);
        }, 100);
    };

    useEffect(() => {
        const fetchTrees = async () => {
            try {
                const [maleRes, femaleRes, homeRes, beautyRes] = await Promise.all([
                    api(`/api/categories/full?gender=Male`),
                    api(`/api/categories/full?gender=Female`),
                    api(`/api/categories/full?category=Home`),
                    api(`/api/categories/full?category=Beauty`),
                ]);
                const maleTree = await maleRes.json();
                const femaleTree = await femaleRes.json();
                let homeTree = await homeRes.json();
                let beautyTree = await beautyRes.json();
                // Filtrér Home/Beauty væk fra Men/Women
                const filterSolo = (tree: CategoryTree) => {
                    const t = { ...tree };
                    SOLO_CATEGORIES.forEach(cat => delete t[cat]);
                    return t;
                };
                // Home skal kun vise Home subcategories
                homeTree = Object.fromEntries(Object.entries(homeTree).filter(([cat]) => cat === "Home"));
                // Beauty skal kun vise Beauty subcategories
                beautyTree = Object.fromEntries(Object.entries(beautyTree).filter(([cat]) => cat === "Beauty"));
                setGenderTrees({ Men: filterSolo(maleTree), Women: filterSolo(femaleTree) });
                setSoloTrees({ Home: homeTree, Beauty: beautyTree });
            } catch {
                setTreeError(true);
            }
        };
        fetchTrees();
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
        <nav ref={navRef} className="bg-background border-b border-border/50 w-full relative">
            <div className="flex flex-wrap items-center justify-center gap-x-1 md:gap-x-4 px-2 py-2 mx-auto max-w-7xl">
                {navLinks.map((link) => {
                    const isGender = link.label in GENDER_MAP;
                    const isBrands = link.label === "Brands";
                    // Tilføj Home/Beauty som solo
                    const isSolo = SOLO_CATEGORIES.includes(link.label);
                    const hasDropdown = isGender || isBrands || isSolo;

                    const sharedClassName = `text-[11px] sm:text-xs md:text-sm whitespace-nowrap px-2 md:px-3 py-1 transition-colors inline-block cursor-pointer ${
                        (link as any).highlight
                            ? "text-accent font-semibold hover:text-burgundy-light"
                            : hovered === link.label
                                ? "text-foreground"
                                : "text-foreground/70 hover:text-foreground"
                    }`;

                    return (
                        <div
                            key={link.label}
                            onMouseEnter={() => hasDropdown ? handleEnter(link.label) : setHovered(null)}
                            onMouseLeave={hasDropdown ? handleLeave : undefined}
                        >
                            {hasDropdown ? (
                                <button
                                    type="button"
                                    className={sharedClassName}
                                    onClick={() => setHovered(prev => prev === link.label ? null : link.label)}
                                >
                                    {link.label}
                                </button>
                            ) : (
                                <Link
                                    href={link.href}
                                    className={sharedClassName}
                                >
                                    {link.label}
                                </Link>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ── Gender megamenu ── */}
            {hovered && hovered in GENDER_MAP && (
                <div
                    className="absolute top-full left-0 right-0 z-[999] flex justify-center px-2 md:px-4"
                    onMouseEnter={() => handleEnter(hovered)}
                    onMouseLeave={handleLeave}
                >
                    <div className="bg-popover border border-border/50 rounded-lg shadow-xl p-4 md:p-6 max-w-[95vw] w-auto mt-1">
                        {!genderTrees[hovered] ? (
                            <p className="text-sm text-muted-foreground">Loading categories…</p>
                        ) : treeError || Object.keys(genderTrees[hovered]).length === 0 ? (
                            <p className="text-sm text-muted-foreground">No categories found.</p>
                        ) : (
                            <div className="flex flex-wrap gap-6 md:gap-8">
                                {Object.entries(genderTrees[hovered]).map(([category, subs]) => (
                                    <div key={`cat-${category}`} className="min-w-[8rem]">
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 font-sans">
                                            {category}
                                        </h4>
                                        <ul className="space-y-2">
                                            {Array.isArray(subs) && subs.length === 0 ? (
                                                <li className="text-xs text-muted-foreground/60 italic">No subcategories</li>
                                            ) : (
                                                subs.map((sub) => (
                                                    <li key={sub.id}>
                                                        <Link
                                                            href={`/products/filter?gender=${GENDER_MAP[hovered]}&subcategory=${sub.id}`}
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
                                href={`/products/filter?gender=${GENDER_MAP[hovered]}`}
                                className="text-xs font-medium text-foreground/60 hover:text-foreground transition-colors uppercase tracking-wider"
                            >
                                See everything in {hovered} →
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Brands megamenu ── */}
            {hovered === "Brands" && (
                <div
                    className="absolute top-full left-0 right-0 z-[999] flex justify-center px-2 md:px-4"
                    onMouseEnter={() => handleEnter("Brands")}
                    onMouseLeave={handleLeave}
                >
                    <div className="bg-popover border border-border/50 rounded-lg shadow-xl p-4 md:p-6 max-w-[95vw] w-auto mt-1">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                            Popular brands
                        </h4>

                        {brands.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Loading brands…</p>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 min-w-[250px]">
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
                                See all brands ({brands.length}) →
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Home/Beauty megamenu ── */}
            {hovered && SOLO_CATEGORIES.includes(hovered) && (
                <div
                    className="absolute top-full left-0 right-0 z-[999] flex justify-center px-2 md:px-4"
                    onMouseEnter={() => handleEnter(hovered)}
                    onMouseLeave={handleLeave}
                >
                    <div className="bg-popover border border-border/50 rounded-lg shadow-xl p-4 md:p-6 max-w-[95vw] w-auto mt-1">
                        {!soloTrees[hovered] ? (
                            <p className="text-sm text-muted-foreground">Loading…</p>
                        ) : treeError || Object.keys(soloTrees[hovered]).length === 0 ? (
                            <p className="text-sm text-muted-foreground">No categories found.</p>
                        ) : (
                            <div className="flex flex-wrap gap-6 md:gap-8">
                                {Object.entries(soloTrees[hovered]).map(([category, subs]) => (
                                    <div key={`cat-${category}`} className="min-w-[8rem]">
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 font-sans">
                                            {category}
                                        </h4>
                                        <ul className="space-y-2">
                                            {Array.isArray(subs) && subs.length === 0 ? (
                                                <li className="text-xs text-muted-foreground/60 italic">No subcategories</li>
                                            ) : (
                                                subs.map((sub) => (
                                                    <li key={sub.id}>
                                                        <Link
                                                            href={`/products/filter?category=${category}&subcategory=${sub.id}`}
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
                                href={`/products/filter?category=${hovered}`}
                                className="text-xs font-medium text-foreground/60 hover:text-foreground transition-colors uppercase tracking-wider"
                            >
                                See everything in {hovered} →
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}