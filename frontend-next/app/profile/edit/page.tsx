'use client';

import { useEffect, useState } from "react";
import { api } from "@/app/api/api";
import Link from "next/link";

export default function EditProfilePage() {
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("");
    const [statusClass, setStatusClass] = useState("");

    const [username, setUsername] = useState("");

    // Adresse til lokation (bruges ofte til søgning/visning)
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("");

    // ⭐ NYE: Specifikke adressefelter til shipping/Stripe
    const [street, setStreet] = useState("");
    const [houseNumber, setHouseNumber] = useState("");
    const [zip, setZip] = useState("");

    const [cvr, setCvr] = useState("");
    const [bio, setBio] = useState("");
    const [language, setLanguage] = useState("da");
    const [avatarPreview, setAvatarPreview] = useState("/avatars/Gilbert.jpeg");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    useEffect(() => {
        async function loadProfile() {
            try {
                const res = await api("/api/users/me");
                const data = await res.json();

                if (!data.success) {
                    setStatus("Could not load profile");
                    setStatusClass("bg-red-600 text-white");
                    return;
                }

                const user = data.data;

                setUsername(user.username || "");
                setCity(user.location?.city || "");
                setCountry(user.location?.country || "");

                // ⭐ Load de nye adressefelter fra profile.address
                setStreet(user.profile?.address?.street || "");
                setHouseNumber(user.profile?.address?.houseNumber || "");
                setZip(user.profile?.address?.zip || "");

                setCvr(user.cvr || "");
                setBio(user.profile?.bio || "");
                setLanguage(user.profile?.language || "da");
                setAvatarPreview(user.profile?.avatarUrl || "/avatars/Gilbert.jpeg");

            } catch {
                setStatus("Server error");
                setStatusClass("bg-red-600 text-white");
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setStatus("Saving...");
        setStatusClass("bg-blue-600 text-white");

        // ⭐ Payload inkluderer nu den fulde adresse i profile objektet
        const payload = {
            username,
            location: { city, country },
            cvr,
            profile: {
                bio,
                language,
                address: {
                    street,
                    houseNumber,
                    zip,
                    city, // Vi genbruger city/country her for at holde det synkroniseret
                    country
                }
            }
        };

        try {
            const res = await api("/api/users/me", {
                method: "PATCH",
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!data.success) {
                setStatus("Error updating profile");
                setStatusClass("bg-red-600 text-white");
                return;
            }

            // Avatar upload håndteres her (uændret)...
            if (avatarFile) {
                const formData = new FormData();
                formData.append("avatar", avatarFile);
                await api("/api/users/me/avatar", { method: "POST", body: formData });
            }

            setStatus("Profile updated successfully");
            setStatusClass("bg-green-700 text-white");

        } catch {
            setStatus("Server error");
            setStatusClass("bg-red-600 text-white");
        }
    }

    if (loading) return <p className="text-center mt-20 text-ivory">Loading profile…</p>;

    return (
        <div className="max-w-lg mx-auto mt-10 p-8 bg-ivory-dark rounded-2xl shadow-2xl border border-racing-green/10 text-racing-green mb-20">
            <div className="flex justify-between items-center mb-8 border-b border-racing-green/10 pb-4">
                <h1 className="text-2xl font-serif font-bold uppercase tracking-tight">Edit Profile</h1>
                <Link href="/profile/me" className="text-sm text-racing-green/60 underline hover:text-racing-green">Back to profile</Link>
            </div>

            {status && <p className={`${statusClass} mb-6 font-semibold text-center p-3 rounded-lg shadow-sm transition-all`}>{status}</p>}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Username */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1">Username</label>
                    <input className="w-full p-3 bg-ivory border border-racing-green/20 rounded-lg text-black" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>

                {/* ⭐ NY ADRESSE SEKTION */}
                <div className="p-4 bg-white/30 rounded-xl border border-racing-green/5 space-y-4">
                    <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-racing-green/40 mb-2">Shipping Address</h3>

                    <div className="flex gap-4">
                        <div className="flex-[3]">
                            <label className="block text-[10px] font-bold uppercase mb-1">Street</label>
                            <input className="w-full p-3 bg-ivory border border-racing-green/20 rounded-lg text-black" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Main St" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-[10px] font-bold uppercase mb-1">No.</label>
                            <input className="w-full p-3 bg-ivory border border-racing-green/20 rounded-lg text-black text-center" value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)} placeholder="42" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold uppercase mb-1">Zip Code</label>
                            <input className="w-full p-3 bg-ivory border border-racing-green/20 rounded-lg text-black" value={zip} onChange={(e) => setZip(e.target.value)} maxLength={4} placeholder="1234" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase mb-1">City</label>
                            <input className="w-full p-3 bg-ivory border border-racing-green/20 rounded-lg text-black" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Copenhagen" />
                        </div>
                    </div>
                </div>

                {/* Country & CVR */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1">Country</label>
                        <input className="w-full p-3 bg-ivory border border-racing-green/20 rounded-lg text-black" value={country} onChange={(e) => setCountry(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1">CVR (optional)</label>
                        <input className="w-full p-3 bg-ivory border border-racing-green/20 rounded-lg text-black" value={cvr} onChange={(e) => setCvr(e.target.value)} />
                    </div>
                </div>

                {/* Bio & Avatar - Samme som før */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1">Bio</label>
                    <textarea className="w-full p-3 bg-ivory border border-racing-green/20 rounded-lg h-24 text-black" value={bio} onChange={(e) => setBio(e.target.value)} />
                </div>

                <button className="w-full bg-racing-green text-ivory py-4 rounded-xl hover:bg-racing-green-dark transition-all font-bold uppercase tracking-widest shadow-lg">
                    Save changes
                </button>
            </form>
        </div>
    );
}