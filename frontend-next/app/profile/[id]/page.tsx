'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/app/api/api";

import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/UI/avatar";
import ProductCard from "@/app/components/product/ProductCard";
import type { ApiProduct, Product } from "@/app/components/product/types";

export default function PublicProfilePage() {
    const router = useRouter();
    const { id } = useParams();

    const [user, setUser] = useState<any>(null);
    const [products, setProducts] = useState<ApiProduct[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);

    const [followers, setFollowers] = useState<any[]>([]);
    const [following, setFollowing] = useState<any[]>([]);
    const [isFollowing, setIsFollowing] = useState<boolean>(false);

    const [showFollowers, setShowFollowers] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);

    // Lock scroll when modal is open
    useEffect(() => {
        if (showFollowers || showFollowing) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }, [showFollowers, showFollowing]);

    // Load logged-in user
    useEffect(() => {
        async function loadCurrentUser() {
            const res = await api("/api/users/me");
            const json = await res.json();
            if (json.success) setCurrentUser(json.data);
        }
        loadCurrentUser();
    }, []);

    // Load public profile user
    useEffect(() => {
        async function loadUser() {
            const res = await api(`/api/users/public/${id}`);
            const json = await res.json();
            if (json.success) setUser(json.data);
        }
        loadUser();
    }, [id]);

    // Load products
    useEffect(() => {
        async function loadProducts() {
            const res = await api(`/api/products/user/${id}`);
            const json = await res.json();
            if (json.success) setProducts(json.data);
        }
        loadProducts();
    }, [id]);

    // Redirect if user visits own profile
    useEffect(() => {
        if (!currentUser || !user) return;
        if (currentUser._id === user._id) {
            router.replace("/profile/me");
        }
    }, [currentUser, user, router]);

    // Load followers + following
    useEffect(() => {
        if (!user) return;

        async function loadFollowData() {
            const resFollowers = await api(`/api/follows/${user._id}/followers`);
            const jsonFollowers = await resFollowers.json();
            if (jsonFollowers.success) setFollowers(jsonFollowers.data);

            const resFollowing = await api(`/api/follows/${user._id}/following`);
            const jsonFollowing = await resFollowing.json();
            if (jsonFollowing.success) setFollowing(jsonFollowing.data);
        }

        loadFollowData();
    }, [user]);

    // Check if current user follows this profile
    useEffect(() => {
        if (!currentUser || !followers) return;

        const already = followers.some(f => f.followerId?._id === currentUser._id);
        setIsFollowing(already);
    }, [currentUser, followers]);

    // Follow
    async function handleFollow() {
        try {
            const res = await api(`/api/follows/${user._id}`, { method: "POST" });
            const json = await res.json();
            if (json.success) {
                setIsFollowing(true);
                setFollowers(prev => [...prev, { followerId: currentUser }]);
            }
        } catch (err) {
            console.error(err);
        }
    }

    // Unfollow
    async function handleUnfollow() {
        try {
            const res = await api(`/api/follows/${user._id}`, { method: "DELETE" });
            const json = await res.json();
            if (json.success) {
                setIsFollowing(false);
                setFollowers(prev => prev.filter(f => f.followerId?._id !== currentUser._id));
            }
        } catch (err) {
            console.error(err);
        }
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

                    {/* Stats */}
                    <div className="flex items-center gap-6 mb-2">
                        <div className="text-center">
                            <p className="text-lg font-semibold text-foreground">{products.length}</p>
                            <p className="text-xs text-muted-foreground">Listings</p>
                        </div>

                        <div className="text-center cursor-pointer" onClick={() => setShowFollowers(true)}>
                            <p className="text-lg font-semibold text-foreground">{followers.length}</p>
                            <p className="text-xs text-muted-foreground">Followers</p>
                        </div>

                        <div className="text-center cursor-pointer" onClick={() => setShowFollowing(true)}>
                            <p className="text-lg font-semibold text-foreground">{following.length}</p>
                            <p className="text-xs text-muted-foreground">Following</p>
                        </div>
                    </div>

                    {/* Follow button */}
                    {currentUser && currentUser._id !== user._id && (
                        isFollowing ? (
                            <button
                                onClick={handleUnfollow}
                                className="mt-2 px-4 py-1 rounded-md bg-muted text-foreground border"
                            >
                                Following
                            </button>
                        ) : (
                            <button
                                onClick={handleFollow}
                                className="mt-2 px-4 py-1 rounded-md bg-burgundy text-ivory"
                            >
                                Follow
                            </button>
                        )
                    )}
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

            {/* Followers Modal */}
            {showFollowers && (
                <div className="fixed inset-0 bg-ivory-dark/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-ivory-dark border border-burgundy/40 p-5 rounded-xl w-80 max-h-[70vh] overflow-y-auto shadow-xl">

                        <h2 className="text-lg font-semibold mb-4 text-racing-green">
                            Followers
                        </h2>

                        {followers.length === 0 ? (
                            <p className="text-sm text-racing-green">No followers yet</p>
                        ) : (
                            <ul className="space-y-3">
                                {followers.map((f) => {
                                    const u = f.followerId;
                                    return (
                                        <li key={u._id} className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border border-burgundy/40">
                                                <AvatarImage src={u.profile?.avatarUrl} />
                                                <AvatarFallback className="bg-racing-green text-ivory-dark">
                                                    {u.username.slice(0,2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>

                                            <Link
                                                href={`/profile/${u._id}`}
                                                className="text- hover:text-burgundy transition"
                                            >
                                                {u.username}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}

                        <button
                            className="mt-5 w-full py-2 rounded-md bg-burgundy text-ivory-dark hover:bg-burgundy/80 transition"
                            onClick={() => setShowFollowers(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Following Modal */}
            {showFollowing && (
                <div className="fixed inset-0 bg-ivory-dark/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-ivory-dark border border-burgundy/40 p-5 rounded-xl w-80 max-h-[70vh] overflow-y-auto shadow-xl">

                        <h2 className="text-lg font-semibold mb-4 text-racing-green">
                            Following
                        </h2>

                        {following.length === 0 ? (
                            <p className="text-sm text-racing-green">Not following anyone yet</p>
                        ) : (
                            <ul className="space-y-3">
                                {following.map((f) => {
                                    const u = f.followingId;
                                    return (
                                        <li key={u._id} className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border border-burgundy/40">
                                                <AvatarImage src={u.profile?.avatarUrl} />
                                                <AvatarFallback className="bg-racing-green text-ivory-dark">
                                                    {u.username.slice(0,2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>

                                            <Link
                                                href={`/profile/${u._id}`}
                                                className="text-ivory-dark hover:text-burgundy transition"
                                            >
                                                {u.username}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}

                        <button
                            className="mt-5 w-full py-2 rounded-md bg-burgundy text-ivory-dark hover:bg-burgundy/80 transition"
                            onClick={() => setShowFollowing(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}


        </div>
    );
}
