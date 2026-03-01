'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/app/api/api";
import { X, Star } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/UI/avatar";
import ProductCard from "@/app/components/product/ProductCard";
import Link from "next/link";

export default function PublicProfilePage() {
    const params = useParams();
    const id = params?.id as string; // Sikrer at vi har ID'et korrekt
    const router = useRouter();

    const [user, setUser] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);

    const [followers, setFollowers] = useState<any[]>([]);
    const [following, setFollowing] = useState<any[]>([]);
    const [isFollowing, setIsFollowing] = useState<boolean>(false);

    const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings');
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

        async function loadInitialData() {
            try {
                const userRes = await api(`/api/users/public/${id}`);
                const userJson = await userRes.json();
                if (userJson.success) setUser(userJson.data);

                const prodRes = await api(`/api/products/user/${id}`);
                const prodJson = await prodRes.json();
                if (prodJson.success) setProducts(prodJson.data);

                const reviewRes = await api(`/api/reviews/user/${id}`);
                const reviewJson = await reviewRes.json();
                if (reviewJson.success) setReviews(reviewJson.reviews || []);

                const fRes = await api(`/api/follows/${id}/followers`);
                const fJson = await fRes.json();
                if (fJson.success) setFollowers(fJson.data || []);

                const fgRes = await api(`/api/follows/${id}/following`);
                const fgJson = await fgRes.json();
                if (fgJson.success) setFollowing(fgJson.data || []);

                const reportRes = await api('/api/reports/reportReasons');
                const reportJson = await reportRes.json();
                if (reportJson.success) setReasons(reportJson.data);

                const meRes = await api("/api/users/me");
                if (meRes.ok) {
                    const meJson = await meRes.json();
                    setCurrentUser(meJson.data);

                    const isFRes = await api(`/api/follows/${id}/is-following`);
                    const isFJson = await isFRes.json();
                    if (isFJson.success) setIsFollowing(isFJson.isFollowing);
                }
            } catch (err) {
                console.error("Fejl ved indlæsning af profil:", err);
            }
        }
        loadInitialData();
    }, [id]);

    const handleFollowToggle = async () => {
        if (!currentUser) return router.push('/login');
        const method = isFollowing ? "DELETE" : "POST";
        try {
            const res = await api(`/api/follows/${id}`, { method });
            if (res.ok) {
                setIsFollowing(!isFollowing);
                const refresh = await api(`/api/follows/${id}/followers`);
                const json = await refresh.json();
                setFollowers(json.data || []);
            }
        } catch (err) { console.error(err); }
    };

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
                setReportMessage("Tak for din anmeldelse.");
                setTimeout(() => {
                    setShowReportModal(false);
                    setReportMessage("");
                }, 2000);
            }
        } catch (err) { console.error(err); }
        finally { setIsSubmitting(false); }
    };

    if (!user) return <div className="p-20 text-center italic font-serif text-racing-green">Henter profil...</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-10 pt-24 text-racing-green mb-20">

            <div className="flex flex-col md:flex-row items-center md:items-start gap-10 mb-16">
                <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-ivory-dark shadow-2xl">
                    <AvatarImage src={user?.profile?.avatarUrl} />
                    <AvatarFallback className="text-3xl bg-racing-green text-ivory">
                        {user?.username?.slice(0, 2).toUpperCase() || "??"}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center md:text-left pt-2">
                    <h1 className="text-4xl md:text-5xl font-serif font-black italic mb-2 tracking-tight">
                        {user?.username}
                    </h1>

                    <div className="flex items-center justify-center md:justify-start gap-2 mb-6">
                        <div className="flex text-racing-green">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                    key={s}
                                    size={18}
                                    className={s <= Math.round(user?.stats?.ratingAverage || 0) ? 'fill-racing-green' : 'text-zinc-200'}
                                />
                            ))}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest ml-2">
                            {user?.stats?.ratingAverage?.toFixed(1) || "0.0"} ({user?.stats?.ratingCount || 0} anmeldelser)
                        </span>
                    </div>

                    <div className="flex justify-center md:justify-start gap-10 mb-8">
                        <div>
                            <p className="text-xl font-black">{products.length}</p>
                            <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-400 font-bold">Annoncer</p>
                        </div>
                        <div className="cursor-pointer group" onClick={() => setShowFollowers(true)}>
                            <p className="text-xl font-black group-hover:text-burgundy transition-colors">{followers.length}</p>
                            <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-400 font-bold">Followers</p>
                        </div>
                        <div className="cursor-pointer group" onClick={() => setShowFollowing(true)}>
                            <p className="text-xl font-black group-hover:text-burgundy transition-colors">{following.length}</p>
                            <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-400 font-bold">Following</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center md:justify-start gap-4">
                        {currentUser?._id !== user?._id && (
                            <>
                                <button
                                    onClick={handleFollowToggle}
                                    className={`px-10 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg ${
                                        isFollowing ? 'bg-ivory-dark text-racing-green/50 border' : 'bg-racing-green text-white'
                                    }`}
                                >
                                    {isFollowing ? "Følger" : "Følg bruger"}
                                </button>
                                <button onClick={() => setShowReportModal(true)} className="text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-burgundy underline">
                                    Anmeld profil
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex gap-12 border-b border-ivory-dark mb-10">
                <button onClick={() => setActiveTab('listings')} className={`pb-4 text-[11px] font-black uppercase tracking-[0.25em] ${activeTab === 'listings' ? 'border-b-2 border-racing-green' : 'text-zinc-300'}`}>Annoncer</button>
                <button onClick={() => setActiveTab('reviews')} className={`pb-4 text-[11px] font-black uppercase tracking-[0.25em] ${activeTab === 'reviews' ? 'border-b-2 border-racing-green' : 'text-zinc-300'}`}>Anmeldelser ({reviews.length})</button>
            </div>

            {activeTab === 'listings' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    {products.map((p) => (
                        <ProductCard
                            key={p._id}
                            product={{
                                id: p._id, title: p.title, brand: p.brand?.name || "Gilbert",
                                price: p.price, imageUrl: p.images?.[0], tag: p.tags?.[0]?.name,
                                isFavorite: false, seller: { username: user.username, rating: user.stats?.ratingAverage }
                            }}
                            onToggleFavorite={() => {}}
                        />
                    ))}
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.map((r: any) => (
                        <div key={r._id} className="bg-white border border-ivory-dark p-8 rounded-[2.5rem] relative shadow-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <Avatar className="h-10 w-10"><AvatarImage src={r.reviewer?.profile?.avatarUrl} /><AvatarFallback>{r.reviewer?.username?.[0]}</AvatarFallback></Avatar>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest">{r.reviewer?.username}</p>
                                    <p className="text-[9px] text-zinc-400">{new Date(r.createdAt).toLocaleDateString('da-DK')}</p>
                                </div>
                            </div>
                            <p className="italic font-serif text-lg leading-relaxed italic">"{r.comment}"</p>
                        </div>
                    ))}
                </div>
            )}

            {/* MODALS */}
            {(showFollowers || showFollowing) && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4" onClick={() => {setShowFollowers(false); setShowFollowing(false)}}>
                    <div className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <button onClick={() => {setShowFollowers(false); setShowFollowing(false)}} className="absolute top-8 right-8 text-zinc-300 hover:text-racing-green"><X size={24} /></button>
                        <h2 className="text-2xl font-serif font-black italic mb-8">{showFollowers ? 'Followers' : 'Following'}</h2>
                        <div className="space-y-4 max-h-[50vh] overflow-y-auto">
                            {(showFollowers ? followers : following).map((item: any) => {
                                const profile = showFollowers ? item.followerId : item.followingId;
                                if (!profile) return null;
                                return (
                                    <Link key={profile._id} href={`/profile/${profile._id}`} className="flex items-center gap-4 p-3 hover:bg-ivory rounded-2xl" onClick={() => {setShowFollowers(false); setShowFollowing(false)}}>
                                        <Avatar className="h-10 w-10"><AvatarImage src={profile.profile?.avatarUrl} /><AvatarFallback>{profile.username?.[0]}</AvatarFallback></Avatar>
                                        <p className="text-sm font-black uppercase tracking-widest">{profile.username}</p>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* REPORT MODAL */}
            {showReportModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex items-center justify-center p-4" onClick={() => setShowReportModal(false)}>
                    <div className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl relative text-racing-green" onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl font-serif font-black italic mb-6">Anmeld profil</h2>
                        {reportMessage ? (
                            <p className="py-10 text-center font-bold text-racing-green">{reportMessage}</p>
                        ) : (
                            <form onSubmit={handleReportSubmit} className="space-y-4">
                                <select className="w-full bg-ivory p-4 rounded-2xl border-none text-sm outline-none" value={reportReason} onChange={(e) => setReportReason(e.target.value)} required>
                                    <option value="">Vælg grund...</option>
                                    {reasons.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                                <textarea className="w-full bg-ivory p-4 rounded-2xl border-none text-sm h-32 outline-none" placeholder="Uddyb gerne..." value={reportDetails} onChange={(e) => setReportDetails(e.target.value)} />
                                <button type="submit" disabled={isSubmitting || !reportReason} className="w-full bg-racing-green text-white py-4 rounded-full font-black uppercase text-[10px] tracking-widest disabled:opacity-50">
                                    {isSubmitting ? "Sender..." : "Send anmeldelse"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}