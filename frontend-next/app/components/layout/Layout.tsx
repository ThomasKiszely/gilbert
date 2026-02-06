'use client';

import Link from "next/link";
import TopBar from "./TopBar";
import { useUser } from "@/hooks/useUser";

export default function Layout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useUser();

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">

            {/* Top Navigation */}
            <TopBar user={user} loading={loading} />

            {/* Page Content */}
            <main className="flex-1 w-full pt-32 pb-20 md:pb-0">
                {children}
            </main>

            {/* Bottom Navigation (Mobile Only) */}
            <footer className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/20 py-3 px-6 flex justify-between md:hidden z-50">
                <Link href="/" className="flex flex-col items-center text-xs text-foreground/70 hover:text-foreground">
                    <span className="text-xl">🏠</span>
                    Home
                </Link>

            </footer>
        </div>
    );
}