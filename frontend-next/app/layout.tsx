import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Layout from "@/app/components/layout/Layout";
// 1. Importer din AuthProvider (husk at oprette filen først!)
import { AuthProvider } from "@/app/context/AuthContext";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "GILBERT | Premium Luxury Marketplace",
    description: "Eksklusiv markedsplads for luksusvarer",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="da">
        <body
            className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background antialiased`}
        >
        {/* 2. Vikl AuthProvider udenom Layout, så alle komponenter kan se brugeren */}
        <AuthProvider>
            <Layout>
                {children}
            </Layout>
        </AuthProvider>
        </body>
        </html>
    );
}