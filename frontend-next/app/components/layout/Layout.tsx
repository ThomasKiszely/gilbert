'use client';

import Link from "next/link";
import TopBar from "./TopBar";
import { useUser } from "@/hooks/useUser";
import BottomNav from "@/app/components/layout/BottomNav";

export default function Layout({ children }: { children: React.ReactNode }) {


    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">

            {/* Top Navigation */}
            <TopBar />

            {/* Page Content */}
            <main className="flex-1 w-full pt-32 pb-20 md:pb-0">
                {children}
            </main>

            {/* Bottom Navigation (Mobile Only) */}
            <BottomNav />

        </div>
    );
}