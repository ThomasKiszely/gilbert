"use client";

import { Home, Search, Plus, Heart, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/app/lib/utils";

interface BottomNavProps {
    onSearchClick: () => void;
}

const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Search", path: "/search", isSearch: true },
    { icon: Plus, label: "Sell", path: "/products/create", isCenter: true },
    { icon: Heart, label: "Favorites", path: "/favorites" },
    { icon: User, label: "Profile", path: "/profile/me" },
];

const BottomNav = ({ onSearchClick } : BottomNavProps) => {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-ivory-dark/95 backdrop-blur-md border-t border-racing-green/10 md:hidden">
            <div className="flex items-center justify-around py-2 px-4 relative">
                {navItems.map((item) => {
                    const isActive = pathname === item.path;
                    const Icon = item.icon;

                    // CENTER BUTTON (Sell)
                    if (item.isCenter) {
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className="flex items-center justify-center -mt-10"
                            >
                                <div className="w-14 h-14 rounded-full bg-racing-green flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:scale-105 transition-transform active:scale-95 border-4 border-ivory-dark">
                                    <Icon className="h-7 w-7 text-ivory" />
                                </div>
                            </Link>
                        );
                    }

                    // SEARCH BUTTON → opens overlay instead of navigating
                    if (item.isSearch) {
                        return (
                            <button
                                key="search"
                                onClick={onSearchClick}
                                className={cn(
                                    "flex flex-col items-center gap-1 py-1 px-3 transition-all duration-200",
                                    "text-racing-green/80 hover:text-racing-green"
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                  Search
                </span>
                            </button>
                        );
                    }

                    // NORMAL NAV ITEMS
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={cn(
                                "flex flex-col items-center gap-1 py-1 px-3 transition-all duration-200",
                                isActive
                                    ? "text-burgundy scale-110"
                                    : "text-racing-green/80 hover:text-racing-green"
                            )}
                        >
                            <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
                            <span
                                className={cn(
                                    "text-[10px] font-bold uppercase tracking-widest",
                                    !isActive && "opacity-70"
                                )}
                            >
                {item.label}
              </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
