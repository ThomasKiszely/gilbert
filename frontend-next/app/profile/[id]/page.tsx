'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/app/api/api";
import { X } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/UI/avatar";
import ProductCard from "@/app/components/product/ProductCard";
import Link from "next/link";
import type { ApiProduct } from "@/app/components/product/types";

export default function PublicProfilePage() {
    const { id } = useParams();
    const router = useRouter();

    const [user, setUser] = useState<any>(null);
    const [products, setProducts] = useState<ApiProduct[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);

    const [followers, setFollowers] = useState<any[]>([]);
    const [following, setFollowing] = useState<any[]>([]);
    const [isFollowing, setIsFollowing] = useState<boolean>(false);

    const [showFollowers, setShowFollowers] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);

    // ⭐ Reporting states
    const [showReportModal, setShowReportModal] = useState(false);
    const [reasons, setReasons] = useState<string[]>([]);
    const [reportReason, setReportReason] = useState("");
    const [reportDetails, setReportDetails] = useState("");
    const [reportMessage, setReportMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Lock scroll
    useEffect(() => {
        const locked = showFollowers || showFollowing || showReportModal;
        document.body.style.overflow = locked ? "hidden" : "";
        document.documentElement.style.overflow = locked ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";
        };
    }, [showFollowers, showFollowing, showReportModal]);

    // Load Data
    useEffect(() => {
        async function loadInitialData() {
            // Hent nuværende bruger separat — fejler stille hvis gæst (401)
            let me: any = null;
            try {
                const meRes = await api("/api/users/me");
                if (meRes.ok) {
                    const meJson = await meRes.json();
                    if (meJson.success) {
                        me = meJson.data;
                        setCurrentUser(meJson.data);
                    }
                }
            } catch (_) {}

            // Hent profil og produkter uafhængigt — virker for alle (gæster + logget ind)
            try {
                const userRes = await api(`/api/users/public/${id}`);
                const userJson = await userRes.json();
                if (userJson.success) setUser(userJson.data);
            } catch (err) { console.error("Profile load error:", err); }

            try {
                const prodRes = await api(`/api/products/user/${id}`);
                const prodJson = await prodRes.json();
                if (prodJson.success) setProducts(prodJson.data);
            } catch (err) { console.error("Products load error:", err); }

            // Hent followers og following
            try {
                const followersRes = await api(`/api/follows/${id}/followers`);
                const followersJson = await followersRes.json();
                if (followersJson.success) setFollowers(followersJson.data);
            } catch (err) { console.error("Followers load error:", err); }

            try {
                const followingRes = await api(`/api/follows/${id}/following`);
                const followingJson = await followingRes.json();
                if (followingJson.success) setFollowing(followingJson.data);
            } catch (err) { console.error("Following load error:", err); }

            // Tjek om nuværende bruger følger denne profil
            if (me) {
                try {
                    const isFollowingRes = await api(`/api/follows/${id}/is-following`);
                    const isFollowingJson = await isFollowingRes.json();
                    if (isFollowingJson.success) setIsFollowing(isFollowingJson.isFollowing);
                } catch (err) { console.error("isFollowing load error:", err); }
            }
        }
        loadInitialData();
    }, [id]);

    // Fetch reasons from backend
    useEffect(() => {
        async function fetchReasons() {
            try {
                const res = await api('/api/reports/reportReasons');
                const json = await res.json();
                if (json.success) setReasons(json.data);
            } catch (err) { console.error(err); }
        }
        fetchReasons();
    }, []);

    // Follow action
    const handleFollowToggle = async () => {
        const method = isFollowing ? "DELETE" : "POST";
        try {
            const res = await api(`/api/follows/${user._id}`, { method });
            if (res.ok) {
                setIsFollowing(!isFollowing);
                const refresh = await api(`/api/follows/${user._id}/followers`);
                const json = await refresh.json();
                setFollowers(json.data);
            }
        } catch (err) { console.error(err); }
    };

    // Report submission
    async function handleReportSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await api('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reportedUserId: user._id, reason: reportReason, details: reportDetails })
            });
            if (res.ok) {
                setReportMessage("Report submitted. Thank you.");
                setTimeout(() => {
                    setShowReportModal(false);
                    setReportMessage("");
                    setReportReason("");
                    setReportDetails("");
                }, 2000);
            }
        } finally { setIsSubmitting(false); }
    }

    if (!user) return <p className="p-6 text-center text-muted-foreground italic font-serif">Loading profile...</p>;

    return (
        <div className="px-4 py-6">

            {/* Profile header */}
            <div className="flex items-start gap-4 mb-4">
                <Avatar className="h-20 w-20 border-2 border-border/30">
                    <AvatarImage src={user.profile?.avatarUrl || ""} alt={user.username} />
                    <AvatarFallback className="bg-muted text-muted-foreground text-lg">
                        {user.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 pt-1">
                    {/* Stats */}
                    <div className="flex items-center gap-6 mb-2">
                        <div className="text-center">
                            <p className="text-lg font-semibold">{products.length}</p>
                            <p className="text-xs text-muted-foreground">Listings</p>
                        </div>
                        <div className="text-center cursor-pointer" onClick={() => setShowFollowers(true)}>
                            <p className="text-lg font-semibold">{followers.length}</p>
                            <p className="text-xs text-muted-foreground">Followers</p>
                        </div>
                        <div className="text-center cursor-pointer" onClick={() => setShowFollowing(true)}>
                            <p className="text-lg font-semibold">{following.length}</p>
                            <p className="text-xs text-muted-foreground">Following</p>
                        </div>
                    </div>

                    {/* Follow button & Report Link */}
                    <div className="flex items-center gap-4 mt-2">
                        {currentUser?._id !== user._id && (
                            <>
                                <button
                                    onClick={handleFollowToggle}
                                    className={`px-6 py-1.5 rounded-md text-sm font-medium transition-all ${isFollowing ? 'bg-muted text-foreground' : 'bg-burgundy text-ivory'}`}
                                >
                                    {isFollowing ? "Following" : "Follow"}
                                </button>

                                {/* ⭐ Simple text link for reporting */}
                                <button
                                    onClick={() => setShowReportModal(true)}
                                    className="text-xs text-muted-foreground hover:text-burgundy underline underline-offset-4 transition-colors font-medium"
                                >
                                    Report User
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Name section */}
            <div className="mb-6">
                <h1 className="text-xl font-serif font-bold text-foreground leading-tight">{user.username}</h1>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>

            {/* Listings Grid */}
            <h2 className="text-sm font-semibold mb-3 border-b pb-2">Listings</h2>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {products.map((p) => (
                    <ProductCard key={p._id} product={{
                        id: p._id, title: p.title, brand: p.brand?.name || "",
                        price: p.price, imageUrl: p.images?.[0] || "/images/placeholder.jpg",
                        tag: p.tags?.[0]?.name, isFavorite: false
                    }} onToggleFavorite={() => {}} />
                ))}
            </div>

            {/* Followers Modal */}
            {showFollowers && (
                <div className="fixed inset-0 bg-ivory-dark/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowFollowers(false)}>
                    <div className="bg-ivory-dark border border-burgundy/40 p-5 rounded-xl w-80 max-h-[70vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-racing-green">Followers</h2>
                            <button onClick={() => setShowFollowers(false)} className="text-racing-green hover:text-burgundy transition">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        {followers.length === 0 ? (
                            <p className="text-sm text-racing-green">No followers yet</p>
                        ) : (
                            <ul className="space-y-3">
                                {followers.map((f) => {
                                    const u = f.followerId;
                                    if (!u) return null;
                                    return (
                                        <li key={u._id} className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border border-burgundy/40">
                                                <AvatarImage src={u.profile?.avatarUrl} />
                                                <AvatarFallback className="bg-racing-green text-ivory-dark">
                                                    {u.username.slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <Link
                                                href={`/profile/${u._id}`}
                                                onClick={() => setShowFollowers(false)}
                                                className="text-racing-green hover:text-burgundy transition"
                                            >
                                                {u.username}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            {/* Following Modal */}
            {showFollowing && (
                <div className="fixed inset-0 bg-ivory-dark/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowFollowing(false)}>
                    <div className="bg-ivory-dark border border-burgundy/40 p-5 rounded-xl w-80 max-h-[70vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-racing-green">Following</h2>
                            <button onClick={() => setShowFollowing(false)} className="text-racing-green hover:text-burgundy transition">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        {following.length === 0 ? (
                            <p className="text-sm text-racing-green">Not following anyone yet</p>
                        ) : (
                            <ul className="space-y-3">
                                {following.map((f) => {
                                    const u = f.followingId;
                                    if (!u) return null;
                                    return (
                                        <li key={u._id} className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border border-burgundy/40">
                                                <AvatarImage src={u.profile?.avatarUrl} />
                                                <AvatarFallback className="bg-racing-green text-ivory-dark">
                                                    {u.username.slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <Link
                                                href={`/profile/${u._id}`}
                                                onClick={() => setShowFollowing(false)}
                                                className="text-racing-green hover:text-burgundy transition"
                                            >
                                                {u.username}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-ivory-dark border border-burgundy/20 p-6 rounded-2xl w-full max-w-sm shadow-2xl text-burgundy">
                        <h2 className="text-lg font-serif font-bold mb-4">Report Profile</h2>

                        {reportMessage ? (
                            <div className="py-6 text-center text-racing-green font-medium">
                                {reportMessage}
                            </div>
                        ) : (
                            <form onSubmit={handleReportSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">Reason</label>
                                    <select
                                        className="w-full bg-ivory p-3 rounded-xl border border-burgundy/10 text-sm outline-none focus:ring-1 focus:ring-burgundy"
                                        value={reportReason}
                                        onChange={(e) => setReportReason(e.target.value)}
                                        required
                                    >
                                        <option value="">Select reason...</option>
                                        {reasons.map((r) => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">Details (Optional)</label>
                                    <textarea
                                        className="w-full bg-ivory p-3 rounded-xl border border-burgundy/10 text-sm h-24 resize-none outline-none focus:ring-1 focus:ring-burgundy"
                                        placeholder="Please provide more information..."
                                        value={reportDetails}
                                        onChange={(e) => setReportDetails(e.target.value)}
                                    />
                                </div>

                                <div className="flex gap-4 pt-2">
                                    <button type="button" onClick={() => setShowReportModal(false)} className="flex-1 text-sm font-medium opacity-60 hover:opacity-100">Cancel</button>
                                    <button type="submit" disabled={isSubmitting || !reportReason} className="flex-1 bg-burgundy text-ivory py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-burgundy/20 disabled:opacity-50 transition-all">
                                        {isSubmitting ? "Sending..." : "Submit"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}