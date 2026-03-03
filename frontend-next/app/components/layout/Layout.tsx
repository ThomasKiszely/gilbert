"use client";

import { useState } from "react";
import BottomNav from "@/app/components/layout/BottomNav";
import SearchOverlay from "@/app/components/SearchOverlay";
import Footer from "@/app/components/layout/Footer";
interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const [searchOpen, setSearchOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">

            <SearchOverlay
                open={searchOpen}
                onClose={() => setSearchOpen(false)}
            />

            <main className="flex-1 w-full pt-24 md:pt-32 pb-20 md:pb-0">
                {children}
            </main>
            <Footer />
            <BottomNav onSearchClick={() => setSearchOpen(true)} />

        </div>
    );
}
