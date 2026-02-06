import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Layout from "@/app/components/layout/Layout";

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
        <Layout>
            {children}
        </Layout>
        </body>
        </html>
    );
}