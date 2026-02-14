'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/app/api/api";

import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/UI/avatar";
import ProductCard from "@/app/components/product/ProductCard";
import type { ApiProduct, Product } from "@/app/components/product/types";

import { useRouter } from "next/navigation";


export default function PublicProfilePage() {
    const router = useRouter();
    const { id } = useParams();
    const [user, setUser] = useState<any>(null);
    const [products, setProducts] = useState<ApiProduct[]>([]);

    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        async function loadCurrentUser() {
            const res = await api("/api/users/me");
            const json = await res.json();
            if (json.success) setCurrentUser(json.data);
        }
        loadCurrentUser();
    }, []);

    useEffect(() => {
        async function loadUser() {
            const res = await api(`/api/users/public/${id}`);
            const json = await res.json();
            if (json.success) setUser(json.data);
        }
        loadUser();
    }, [id]);

    useEffect(() => {
        async function loadProducts() {
            const res = await api(`/api/products/user/${id}`);
            const json = await res.json();
            if (json.success) setProducts(json.data);
        }
        loadProducts();
    }, [id]);

    useEffect(() => {
        if(!currentUser || !user) return;
        if(currentUser._id === user._id) {
            router.replace("/profile/me");
        }
    }, [currentUser, user, router]);

    if(currentUser && user && currentUser._id === user._id) {
        return null;
    }

    if (!user) return <p className="p-6 text-center text-muted-foreground">Loading…</p>;




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
            </div>

            {/* Name */}
            <div className="mb-6">
                <h1 className="text-xl font-serif font-bold text-foreground">{user.username}</h1>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>

            {/* Listings */}
            <h2 className="text-sm font-semibold mb-2 text-foreground">Listings</h2>

            {products.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                    No listings yet
                </div>
            ) : (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {products.map((p) => {
                        const mapped: Product = {
                            id: p._id,
                            title: p.title,
                            brand: p.brand?.name || "",
                            price: p.price,
                            imageUrl: p.images?.[0] || "/images/ImagePlaceholder.jpg",
                            tag: p.tags?.[0]?.name,
                            isFavorite: false,
                        };

                        return (
                            <ProductCard key={p._id} product={mapped} onToggleFavorite={() => {}} />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
