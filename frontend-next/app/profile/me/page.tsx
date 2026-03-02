'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/app/api/api";
import { toggleFavorite } from "@/app/api/favorites";

import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/UI/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/UI/tabs";
import { Settings, X, ArrowRight } from "lucide-react";
import { Button } from "@/app/components/UI/button";

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator
} from "@/app/components/UI/dropdown-menu";

import ProductCard from "@/app/components/product/ProductCard";
import type { ApiProduct } from "@/app/components/product/types";
import Image from "next/image";

interface OrderItem {
    _id: string;
    product?: { title?: string; images?: string[] };
    totalAmount?: number;
    sellerPayout?: number;
    status?: string;
}

interface FollowUser {
    _id: string;
    username: string;
    profile?: { avatarUrl?: string };
}

interface FollowEntry {
    followerId?: FollowUser;
    followingId?: FollowUser;
}

interface UserProfile {
    _id: string;
    username: string;
    cvr?: string;
    location?: { city?: string; country?: string };
    profile?: { bio?: string; language?: string; avatarUrl?: string };
    role: string;
}

const MePage = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [products, setProducts] = useState<ApiProduct[]>([]);
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [soldItems, setSoldItems] = useState<OrderItem[]>([]);

    const router = useRouter();
    const [followers, setFollowers] = useState<FollowEntry[]>([]);
    const [following, setFollowing] = useState<FollowEntry[]>([]);
    const [showFollowers, setShowFollowers] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);

    useEffect(() => {
        async function loadAll() {
            try {
                // 1. Hent profil først da vi skal bruge user._id
                const profileRes = await api("/api/users/me");
                const profileJson = await profileRes.json();
                if (!profileJson.success) return;
                const userData = profileJson.data;
                setUser(userData);

                // 2. Hent alt andet parallelt
                const [productsRes, favRes, ordersRes, salesRes, followersRes, followingRes] =
                    await Promise.allSettled([
                        api(`/api/products/user/${userData._id}?all=true`),
                        api("/api/favorites"),
                        api("/api/orders/my-orders"),
                        api("/api/orders/my-sales"),
                        api(`/api/follows/${userData._id}/followers`),
                        api(`/api/follows/${userData._id}/following`),
                    ]);

                // Favorites
                let favoriteIds = new Set<string>();
                if (favRes.status === "fulfilled") {
                    try {
                        const favData = await favRes.value.json();
                        if (favData.success) {
                            favoriteIds = new Set(
                                (favData.favorites || []).map((f: { _id: string }) => String(f._id))
                            );
                        }
                    } catch {}
                }

                // Produkter med isFavorite
                if (productsRes.status === "fulfilled") {
                    const json = await productsRes.value.json();
                    if (json.success) {
                        setProducts((json.data || []).map((p: ApiProduct) => ({
                            ...p,
                            isFavorite: favoriteIds.has(String(p._id)),
                        })));
                    }
                }

                if (ordersRes.status === "fulfilled") {
                    const json = await ordersRes.value.json();
                    if (json.success) setOrders(json.data);
                }

                if (salesRes.status === "fulfilled") {
                    const json = await salesRes.value.json();
                    if (json.success) setSoldItems(json.data);
                }

                if (followersRes.status === "fulfilled") {
                    const json = await followersRes.value.json();
                    if (json.success) setFollowers(json.data);
                }

                if (followingRes.status === "fulfilled") {
                    const json = await followingRes.value.json();
                    if (json.success) setFollowing(json.data);
                }

            } catch (err) {
                console.error("Profile load error", err);
            }
        }
        loadAll();
    }, []);

    // Body scroll lock til modals
    useEffect(() => {
        const locked = showFollowers || showFollowing;
        document.body.style.overflow = locked ? "hidden" : "";
        document.documentElement.style.overflow = locked ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";
        };
    }, [showFollowers, showFollowing]);

    async function handleToggleFavorite(productId: string) {
        setProducts(prev =>
            prev.map(p => p._id === productId ? { ...p, isFavorite: !p.isFavorite } : p)
        );
        const success = await toggleFavorite(productId);
        if (!success) {
            setProducts(prev =>
                prev.map(p => p._id === productId ? { ...p, isFavorite: !p.isFavorite } : p)
            );
        }
    }

    async function handleLogout() {
        try { await api("/api/auth/logout", { method: "POST" }); } catch {}
        localStorage.removeItem("token");
        router.push("/");
    }

    if (!user) return <p className="p-6 text-center text-muted-foreground">Loading…</p>;

    const initials = user.username.slice(0, 2).toUpperCase();

    return (
        <div className="px-4 py-6 max-w-5xl mx-auto">
            {/* --- PROFILE HEADER --- */}
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
                        <div className="text-center cursor-pointer" onClick={() => setShowFollowers(true)}>
                            <p className="text-lg font-semibold text-foreground">{followers.length}</p>
                            <p className="text-xs text-muted-foreground">Followers</p>
                        </div>
                        <div className="text-center cursor-pointer" onClick={() => setShowFollowing(true)}>
                            <p className="text-lg font-semibold text-foreground">{following.length}</p>
                            <p className="text-xs text-muted-foreground">Following</p>
                        </div>
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0 hover:bg-burgundy hover:text-ivory">
                            <Settings className="h-5 w-5 text-muted-foreground" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild><Link href="/profile/edit">Edit profile</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/profile/change-email">Change email</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/profile/change-password">Change password</Link></DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user?.role === "admin" && (
                            <DropdownMenuItem asChild>
                                <Link href="/admin" className="text-accent font-semibold">Admin panel</Link>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild><Link href="/products/create">Post a new product</Link></DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600">Log out</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="mb-6">
                <h1 className="text-xl font-serif font-bold text-foreground">{user.username}</h1>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>

            {/* --- TABS --- */}
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

                {/* TAB: LISTINGS */}
                <TabsContent value="listings" className="mt-4">
                    {products.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground text-sm">No listings yet</div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                            {products.map((p) => {
                                const mappedProduct = {
                                    id: p._id,
                                    title: p.title,
                                    brand: p.brand?.name || "",
                                    price: p.price,
                                    imageUrl: p.images?.[0] || "/images/ImagePlaceholder.jpg",
                                    tag: p.tags?.[0]?.name,
                                    isFavorite: Boolean(p.isFavorite),
                                };
                                return (
                                    <div key={p._id}>
                                        <ProductCard product={mappedProduct} onToggleFavorite={handleToggleFavorite} />
                                        <p className="text-xs mt-1 font-medium text-muted-foreground">Status: {p.status}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>

                {/* TAB: SOLD (Salg) */}
                <TabsContent value="sold" className="mt-4">
                    {soldItems.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground text-sm italic">No sold items yet</div>
                    ) : (
                        <div className="space-y-3">
                            {soldItems.map(item => (
                                <Link href={`/orders/${item._id}`} key={item._id} className="flex items-center justify-between p-4 bg-white border border-border rounded-2xl hover:bg-muted/30 transition shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-muted rounded-lg overflow-hidden shrink-0 border relative">
                                            <Image src={item.product?.images?.[0] || "/images/ImagePlaceholder.jpg"} alt={item.product?.title || "Product"} className="object-cover" fill sizes="48px" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold truncate max-w-[150px]">{item.product?.title || "Deleted Product"}</p>
                                            <p className="text-xs text-green-600 font-bold">Payout: {item.sellerPayout || item.totalAmount} DKK</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground">{item.status}</p>
                                        <ArrowRight size={14} className="ml-auto mt-1 text-muted-foreground" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* TAB: ORDERS (Køb) */}
                <TabsContent value="orders" className="mt-4">
                    {orders.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground text-sm italic">No orders yet</div>
                    ) : (
                        <div className="space-y-3">
                            {orders.map(order => (
                                <Link href={`/orders/${order._id}`} key={order._id} className="flex items-center justify-between p-4 bg-white border border-border rounded-2xl hover:bg-muted/30 transition shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-muted rounded-lg overflow-hidden shrink-0 border relative">
                                            <Image src={order.product?.images?.[0] || "/images/ImagePlaceholder.jpg"} alt={order.product?.title || "Product"} className="object-cover" fill sizes="48px" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold truncate max-w-[150px]">{order.product?.title || "Deleted Product"}</p>
                                            <p className="text-xs text-burgundy font-bold">{order.totalAmount} DKK</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground">{order.status}</p>
                                        <ArrowRight size={14} className="ml-auto mt-1 text-muted-foreground" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* TAB: INFO */}
                <TabsContent value="info" className="mt-4">
                    <div className="space-y-2 text-sm text-muted-foreground bg-muted/20 p-6 rounded-2xl">
                        <p><strong>City:</strong> {user.location?.city || "Not specified"}</p>
                        <p><strong>Country:</strong> {user.location?.country || "Not specified"}</p>
                        <p><strong>CVR:</strong> {user.cvr || "N/A"}</p>
                        <p><strong>Bio:</strong></p>
                        <p className="italic">{user.profile?.bio || "No bio yet..."}</p>
                        <p><strong>Language:</strong> {user.profile?.language || "en"}</p>
                    </div>
                </TabsContent>

                {/* TAB: HELP */}
                <TabsContent value="help" className="mt-4">
                    <div className="text-center py-12 text-muted-foreground text-sm italic">
                        Contact support for assistance with orders or listings.
                    </div>
                </TabsContent>
            </Tabs>

            {/* --- MODAL: FOLLOWERS --- */}
            {showFollowers && (
                <div className="fixed inset-0 bg-ivory-dark/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowFollowers(false)}>
                    <div className="bg-ivory-dark border border-burgundy/40 p-5 rounded-xl w-80 max-h-[70vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-racing-green">Followers</h2>
                            <button onClick={() => setShowFollowers(false)} className="text-racing-green hover:text-burgundy transition">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        {followers.length === 0 ? <p className="text-sm text-racing-green">No followers yet</p> : (
                            <ul className="space-y-3">
                                {followers.map((f) => {
                                    const u = f.followerId;
                                    if (!u) return null;
                                    return (
                                        <li key={u._id} className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border border-burgundy/40">
                                                <AvatarImage src={u.profile?.avatarUrl} />
                                                <AvatarFallback className="bg-racing-green text-ivory-dark">{u.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <button onClick={() => { setShowFollowers(false); router.push(`/profile/${u._id}`); }} className="text-racing-green hover:text-burgundy transition text-left text-sm font-medium">{u.username}</button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            {/* --- MODAL: FOLLOWING --- */}
            {showFollowing && (
                <div className="fixed inset-0 bg-ivory-dark/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowFollowing(false)}>
                    <div className="bg-ivory-dark border border-burgundy/40 p-5 rounded-xl w-80 max-h-[70vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-racing-green">Following</h2>
                            <button onClick={() => setShowFollowing(false)} className="text-racing-green hover:text-burgundy transition">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        {following.length === 0 ? <p className="text-sm text-racing-green">Not following anyone yet</p> : (
                            <ul className="space-y-3">
                                {following.map((f) => {
                                    const u = f.followingId;
                                    if (!u) return null;
                                    return (
                                        <li key={u._id} className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border border-burgundy/40">
                                                <AvatarImage src={u.profile?.avatarUrl} />
                                                <AvatarFallback className="bg-racing-green text-ivory-dark">{u.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <button onClick={() => { setShowFollowing(false); router.push(`/profile/${u._id}`); }} className="text-racing-green hover:text-burgundy transition text-left text-sm font-medium">{u.username}</button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MePage;