'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/app/api/api";

import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/UI/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/UI/tabs";
import { Settings } from "lucide-react";
import { Button } from "@/app/components/UI/button";

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator
} from "@/app/components/UI/dropdown-menu";

import ProductCard from "@/app/components/product/ProductCard";
import type { Product, ApiProduct } from "@/app/components/product/types";

interface UserProfile {
    username: string;
    cvr?: string;
    location?: { city?: string; country?: string };
    profile?: { bio?: string; language?: string; avatarUrl?: string };
    role: string;
}

const MePage = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [products, setProducts] = useState<ApiProduct[]>([]);
    const router = useRouter();

    useEffect(() => {
        async function loadProfile() {
            try {
                const res = await api("/api/users/me");
                const json = await res.json();
                if (!json.success) throw new Error("Could not fetch profile");
                setUser(json.data);
            } catch {}
        }
        loadProfile();
    }, []);

    useEffect(() => {
        async function loadMyProducts() {
            try {
                const res = await api("/api/products/me");
                const json = await res.json();
                if (!json.success) throw new Error("Could not fetch products");
                setProducts(json.data);
            } catch {}
        }
        loadMyProducts();
    }, []);

    async function handleLogout() {
        try {
            await api("/api/auth/logout", { method: "POST" });
        } catch {}
        localStorage.removeItem("token");
        router.push("/");
    }

    if (!user) {
        return <p className="p-6 text-center text-muted-foreground">Loading…</p>;
    }

    const initials = user.username.slice(0, 2).toUpperCase();

    return (
        <div className="px-4 py-6">

            {/* Profile header */}
            <div className="flex items-start gap-4 mb-4">
                <Avatar className="h-20 w-20 border-2 border-border/30">
                    <AvatarImage src={user.profile?.avatarUrl || ""} alt={user.username} />
                    <AvatarFallback className="bg-muted text-muted-foreground text-lg font-serif">
                        {initials}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 pt-1">
                    <div className="flex items-center gap-6 mb-2">
                        <div className="text-center">
                            <p className="text-lg font-semibold text-foreground">{products.length}</p>
                            <p className="text-xs text-muted-foreground">Listings</p>
                        </div>

                        <div className="text-center">
                            <p className="text-lg font-semibold text-foreground">0</p>
                            <p className="text-xs text-muted-foreground">Followers</p>
                        </div>
                    </div>
                </div>

                {/* SETTINGS */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0 hover:bg-burgundy hover:text-ivory">
                            <Settings className="h-5 w-5 text-muted-foreground" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                            <Link href="/profile/edit">Edit profile</Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                            <Link href="/profile/change-email">Change email</Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                            <Link href="/profile/change-password">Change password</Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {/* ADMIN ONLY */}
                        {user?.role === "admin" && (
                            <DropdownMenuItem asChild>
                                <Link href="/admin" className="text-accent font-semibold">
                                    Admin panel
                                </Link>
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem asChild>
                            <Link href="/products/create">Post a new product</Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>

                </DropdownMenu>
            </div>

            {/* Name */}
            <div className="mb-6">
                <h1 className="text-xl font-serif font-bold text-foreground">{user.username}</h1>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="listings" className="w-full">
                <TabsList className="w-full bg-muted/50 rounded-lg h-auto p-1 gap-0">
                    {["Listings", "Sold", "Orders", "Info", "Help"].map((tab) => (
                        <TabsTrigger
                            key={tab}
                            value={tab.toLowerCase()}
                            className="flex-1 text-xs py-2 px-1 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md"
                        >
                            {tab}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* LISTINGS */}
                <TabsContent value="listings" className="mt-4">
                    {products.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground text-sm">No listings yet</div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                            {products.map((p) => {
                                const mappedProduct: Product = {
                                    id: p._id,
                                    title: p.title,
                                    brand: p.brand?.name || "",
                                    price: p.price,
                                    imageUrl: p.images?.[0] || "/images/ImagePlaceholder.jpg",
                                    tag: p.tags?.[0]?.name,
                                    isFavorite: p.isFavorite ?? false,
                                };

                                return (
                                    <div key={p._id}>
                                        <ProductCard product={mappedProduct} onToggleFavorite={() => {}} />
                                        <p className="text-xs mt-1 font-medium text-muted-foreground">
                                            Status: {p.status}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>

                {/* SOLD */}
                <TabsContent value="sold" className="mt-4">
                    <div className="text-center py-12 text-muted-foreground text-sm">
                        No sold items yet
                    </div>
                </TabsContent>

                {/* ORDERS */}
                <TabsContent value="orders" className="mt-4">
                    <div className="text-center py-12 text-muted-foreground text-sm">
                        No orders yet
                    </div>
                </TabsContent>

                {/* INFO */}
                <TabsContent value="info" className="mt-4">
                    <div className="space-y-2 text-sm text-muted-foreground">
                        <p><strong>City:</strong> {user.location?.city || "Not specified"}</p>
                        <p><strong>Country:</strong> {user.location?.country || "Not specified"}</p>
                        <p><strong>CVR:</strong> {user.cvr || "N/A"}</p>
                        <p><strong>Bio:</strong></p>
                        <p className="italic">{user.profile?.bio || "No bio yet..."}</p>
                        <p><strong>Language:</strong> {user.profile?.language || "en"}</p>
                    </div>
                </TabsContent>

                {/* HELP */}
                <TabsContent value="help" className="mt-4">
                    <div className="text-center py-12 text-muted-foreground text-sm">
                        Help and support
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default MePage;
