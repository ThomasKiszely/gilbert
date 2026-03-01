'use client';

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/app/api/api";
import { toggleFavorite } from "@/app/api/favorites";
import { X, Star } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/UI/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/UI/tabs";
import { Button } from "@/app/components/UI/button";
import ProductCard from "@/app/components/product/ProductCard";

export default function PublicProfilePage() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();

    // Core data states
    const [user, setUser] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);

    const [followers, setFollowers] = useState<any[]>([]);
    const [following, setFollowing] = useState<any[]>([]);
    const [isFollowing, setIsFollowing] = useState<boolean>(false);

    const [showFollowers, setShowFollowers] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);

    // Reporting states
    const [showReportModal, setShowReportModal] = useState(false);
    const [reasons, setReasons] = useState<string[]>([]);
    const [reportReason, setReportReason] = useState("");
    const [reportDetails, setReportDetails] = useState("");
    const [reportMessage, setReportMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!id) return;
        const controller = new AbortController();

        async function loadInitialData() {
            try {
                // PERFORMANCE: Hent ALT parallelt (inklusive is-following)
                const [userRes, prodRes, favRes, reviewRes, fRes, fgRes, reportRes, meRes, isFRes] =
                    await Promise.allSettled([
                        api(`/api/users/public/${id}`, { signal: controller.signal }),
                        api(`/api/products/user/${id}`),
                        api("/api/favorites"),
                        api(`/api/reviews/user/${id}`),
                        api(`/api/follows/${id}/followers`),
                        api(`/api/follows/${id}/following`),
                        api('/api/reports/reportReasons'),
                        api("/api/users/me"),
                        api(`/api/follows/${id}/is-following`)
                    ]);

                if (userRes.status === "fulfilled") {
                    const json = await userRes.value.json();
                    if (json.success) setUser(json.data);
                }

                // Byg favoriteIds
                let favoriteIds = new Set<string>();
                if (favRes.status === "fulfilled") {
                    try {
                        const favJson = await favRes.value.json();
                        if (favJson.success) {
                            favoriteIds = new Set((favJson.favorites || []).map((f: any) => String(f._id)));
                        }
                    } catch {}
                }

                // Produkter med isFavorite
                if (prodRes.status === "fulfilled") {
                    const prodJson = await prodRes.value.json();
                    if (prodJson.success) {
                        const approved = (prodJson.data || []).filter((p: any) => p.status === "Approved");
                        setProducts(approved.map((p: any) => ({
                            id: p._id,
                            title: p.title,
                            brand: p.brand?.name || "",
                            price: p.price,
                            imageUrl: p.images?.[0] || "/images/ImagePlaceholder.jpg",
                            tag: p.tags?.[0]?.name,
                            isFavorite: favoriteIds.has(String(p._id)),
                        })));
                    }
                }

                if (reviewRes.status === "fulfilled") {
                    const json = await reviewRes.value.json();
                    if (json.success) setReviews(json.reviews || []);
                }

                if (fRes.status === "fulfilled") {
                    const json = await fRes.value.json();
                    if (json.success) setFollowers(json.data || []);
                }

                if (fgRes.status === "fulfilled") {
                    const json = await fgRes.value.json();
                    if (json.success) setFollowing(json.data || []);
                }

                if (reportRes.status === "fulfilled") {
                    const json = await reportRes.value.json();
                    if (json.success) setReasons(json.data);
                }

                if (meRes.status === "fulfilled" && meRes.value.ok) {
                    const meJson = await meRes.value.json();
                    setCurrentUser(meJson.data);
                }

                if (isFRes.status === "fulfilled" && isFRes.value.ok) {
                    const isFJson = await isFRes.value.json();
                    if (isFJson.success) setIsFollowing(isFJson.isFollowing);
                }
            } catch (err: any) {
                if (err.name !== 'AbortError') console.error("Error loading profile:", err);
            }
        }
        loadInitialData();
        return () => controller.abort();
    }, [id]);

    // Body scroll lock
    useEffect(() => {
        const locked = showFollowers || showFollowing || showReportModal;
        document.body.style.overflow = locked ? "hidden" : "";
        document.documentElement.style.overflow = locked ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";
        };
    }, [showFollowers, showFollowing, showReportModal]);

    const handleFollowToggle = useCallback(async () => {
        if (!currentUser) return router.push('/login');
        const wasFollowing = isFollowing;
        setIsFollowing(!wasFollowing); // Optimistic

        try {
            const method = wasFollowing ? "DELETE" : "POST";
            const res = await api(`/api/follows/${id}`, { method });
            if (res.ok) {
                const refresh = await api(`/api/follows/${id}/followers`);
                const json = await refresh.json();
                setFollowers(json.data || []);
            } else {
                throw new Error();
            }
        } catch (err) {
            setIsFollowing(wasFollowing); // Rollback
        }
    }, [currentUser, isFollowing, id, router]);

    const handleToggleFavorite = useCallback(async (productId: string) => {
        if (!currentUser) return router.push('/login');

        setProducts(prev =>
            prev.map(p => p.id === productId ? { ...p, isFavorite: !p.isFavorite } : p)
        );

        const success = await toggleFavorite(productId);
        if (!success) {
            setProducts(prev =>
                prev.map(p => p.id === productId ? { ...p, isFavorite: !p.isFavorite } : p)
            );
        }
    }, [currentUser, router]);

    const handleReportSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await api('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reportedUserId: id, reason: reportReason, details: reportDetails })
            });
            if (res.ok) {
                setReportMessage("Thank you for your report.");
                setTimeout(() => {
                    setShowReportModal(false);
                    setReportMessage("");
                }, 2000);
            }
        } catch (err) { console.error(err); }
        finally { setIsSubmitting(false); }
    };

    if (!user) return <p className="p-6 text-center text-muted-foreground">Loading…</p>;

    const initials = user?.username?.slice(0, 2).toUpperCase() || "??";
    const ratingAvg = user?.stats?.ratingAverage || 0;
    const ratingCount = user?.stats?.ratingCount || 0;

    return (
        <div className="px-4 py-6 max-w-5xl mx-auto">
            {/* --- PROFILE HEADER --- */}
            <div className="flex items-start gap-4 mb-4">
                <Avatar className="h-20 w-20 border-2 border-border/30">
                    <AvatarImage src={user?.profile?.avatarUrl || ""} alt={user.username} />
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

                    <div className="flex items-center gap-1.5 mb-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                                key={s}
                                size={14}
                                className={s <= Math.round(ratingAvg)
                                    ? 'fill-foreground text-foreground'
                                    : 'text-muted-foreground/30'}
                            />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">
                            {ratingAvg > 0 ? ratingAvg.toFixed(1) : "No ratings"}{ratingCount > 0 ? ` (${ratingCount})` : ""}
                        </span>
                    </div>
                </div>

                {currentUser && currentUser._id !== user._id && (
                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            variant={isFollowing ? "outline" : "default"}
                            size="sm"
                            onClick={handleFollowToggle}
                            className="rounded-full text-xs px-5"
                        >
                            {isFollowing ? "Following" : "Follow"}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowReportModal(true)}
                            className="rounded-full text-xs text-muted-foreground hover:text-destructive px-3"
                        >
                            Report
                        </Button>
                    </div>
                )}
            </div>

            <div className="mb-6">
                <h1 className="text-xl font-serif font-bold text-foreground">{user.username}</h1>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
                {user?.profile?.bio && (
                    <p className="text-sm text-muted-foreground mt-1 italic">{user.profile.bio}</p>
                )}
            </div>

            <Tabs defaultValue="listings" className="w-full">
                <TabsList className="w-full bg-muted/50 rounded-lg h-auto p-1 gap-0">
                    {[
                        { label: "Listings", value: "listings" },
                        { label: `Reviews (${reviews.length})`, value: "reviews" },
                        { label: "Info", value: "info" },
                    ].map((tab) => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="flex-1 text-xs py-2 px-1 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md"
                        >
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="listings" className="mt-4">
                    {products.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground text-sm">No listings yet</div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                            {products.map((p) => (
                                <ProductCard key={p.id} product={p} onToggleFavorite={handleToggleFavorite} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="reviews" className="mt-4">
                    {reviews.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground text-sm italic">No reviews yet</div>
                    ) : (
                        <div className="space-y-3">
                            {reviews.map((r: any) => (
                                <div key={r._id} className="p-4 bg-white border border-border rounded-2xl shadow-sm">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Avatar className="h-9 w-9 border border-border/30">
                                            <AvatarImage src={r.reviewer?.profile?.avatarUrl} />
                                            <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                                                {r.reviewer?.username?.[0]?.toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">{r.reviewer?.username}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(r.createdAt).toLocaleDateString('en-GB')}
                                            </p>
                                        </div>
                                        {r.rating && (
                                            <div className="ml-auto flex items-center gap-0.5">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star key={s} size={12} className={s <= r.rating ? 'fill-foreground text-foreground' : 'text-muted-foreground/30'} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground italic">"{r.comment}"</p>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>

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
            </Tabs>

            {/* MODALS BEHOLDES MED DINE FARVER OG KLASSER (ivory-dark, burgundy, osv.) */}
            {showFollowers && (
                <div className="fixed inset-0 bg-ivory-dark/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowFollowers(false)}>
                    <div className="bg-ivory-dark border border-burgundy/40 p-5 rounded-xl w-80 max-h-[70vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-racing-green">Followers</h2>
                            <button onClick={() => setShowFollowers(false)} className="text-racing-green hover:text-burgundy transition"><X className="h-5 w-5" /></button>
                        </div>
                        {followers.length === 0 ? <p className="text-sm text-racing-green">No followers yet</p> : (
                            <ul className="space-y-3">
                                {followers.map((f, i) => {
                                    const u = f.followerId;
                                    if (!u) return null;
                                    return (
                                        <li key={u._id || i} className="flex items-center gap-3">
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

            {showFollowing && (
                <div className="fixed inset-0 bg-ivory-dark/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowFollowing(false)}>
                    <div className="bg-ivory-dark border border-burgundy/40 p-5 rounded-xl w-80 max-h-[70vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-racing-green">Following</h2>
                            <button onClick={() => setShowFollowing(false)} className="text-racing-green hover:text-burgundy transition"><X className="h-5 w-5" /></button>
                        </div>
                        {following.length === 0 ? <p className="text-sm text-racing-green">Not following anyone yet</p> : (
                            <ul className="space-y-3">
                                {following.map((f, i) => {
                                    const u = f.followingId;
                                    if (!u) return null;
                                    return (
                                        <li key={u._id || i} className="flex items-center gap-3">
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

            {showReportModal && (
                <div className="fixed inset-0 bg-ivory-dark/40 backdrop-blur-sm flex items-center justify-center z-[60]" onClick={() => setShowReportModal(false)}>
                    <div className="bg-ivory-dark border border-burgundy/40 p-5 rounded-xl w-80 shadow-xl text-racing-green" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Report profile</h2>
                            <button onClick={() => setShowReportModal(false)} className="text-racing-green hover:text-burgundy transition"><X className="h-5 w-5" /></button>
                        </div>
                        {reportMessage ? <p className="py-6 text-center text-sm font-medium">{reportMessage}</p> : (
                            <form onSubmit={handleReportSubmit} className="space-y-3">
                                <select className="w-full bg-white border border-border/40 p-3 rounded-xl text-sm outline-none" value={reportReason} onChange={(e) => setReportReason(e.target.value)} required>
                                    <option value="">Select reason...</option>
                                    {reasons.map((r, i) => <option key={i} value={r}>{r}</option>)}
                                </select>
                                <textarea className="w-full bg-white border border-border/40 p-3 rounded-xl text-sm h-28 outline-none resize-none" placeholder="Add details (optional)..." value={reportDetails} onChange={(e) => setReportDetails(e.target.value)} />
                                <button type="submit" disabled={isSubmitting || !reportReason} className="w-full bg-racing-green text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-50 transition hover:bg-racing-green/90">
                                    {isSubmitting ? "Sending..." : "Send report"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}