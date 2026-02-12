"use client";

import { useState } from "react";
import BottomNav from "@/app/components/layout/BottomNav";
import SearchOverlay from "@/app/components/SearchOverlay";

interface LayoutProps {
    children: React.ReactNode;
}

interface SearchResults {
    products: any[];
    users: any[];
}

export default function Layout({ children }: LayoutProps) {
    const [searchOpen, setSearchOpen] = useState(false);

    const [searchResults, setSearchResults] = useState<SearchResults>({
        products: [],
        users: []
    });

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">

            <SearchOverlay
                open={searchOpen}
                onClose={() => setSearchOpen(false)}
                onResults={(data) => setSearchResults(data)}
            />

            <main className="flex-1 w-full pt-12 md:pt-16 pb-20 md:pb-0">
                {children}
            </main>

            <BottomNav onSearchClick={() => setSearchOpen(true)} />

        </div>
    );
}
