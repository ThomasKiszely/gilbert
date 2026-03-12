'use client';

import { useEffect, useState } from "react";
import { api } from "@/app/api/api";
import Link from "next/link";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react"; // Tilføjet ikoner

export default function EditProfilePage() {
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("");
    const [statusClass, setStatusClass] = useState("");

    const [username, setUsername] = useState("");
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("");
    const [street, setStreet] = useState("");
    const [houseNumber, setHouseNumber] = useState("");
    const [zip, setZip] = useState("");

    const [cvr, setCvr] = useState("");
    const [bio, setBio] = useState("");
    const [language, setLanguage] = useState("da");
    const [avatarPreview, setAvatarPreview] = useState("/avatars/Gilbert.jpeg");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    // ⭐ NYE: State til sletning
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState("");

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
        setStatusClass("bg-blue-600 text-white shadow-lg");

        const payload = {
            username,
            location: { city, country },
            cvr,
            profile: {
                bio,
                language,
                address: { street, houseNumber, zip, city, country }
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

    // ⭐ NY: Håndtering af slet-anmodning
    async function handleDeleteAccount() {
        const confirmed = confirm("Are you sure you want to delete your account? You will receive an email to confirm this action. This cannot be undone.");

        if (!confirmed) return;

        setIsDeleting(true);
        setDeleteMessage("");

        try {
            const res = await api("/api/users/me/request-delete", {
                method: "POST"
            });
            const data = await res.json();

            if (data.success) {
                setDeleteMessage("Request sent. Please check your email to confirm.");
            } else {
                setDeleteMessage(data.error || "Something went wrong.");
            }
        } catch (err) {
            setDeleteMessage("Could not connect to server.");
        } finally {
            setIsDeleting(false);
        }
    }

    if (loading) return <p className="text-center mt-20 text-ivory animate-pulse font-serif italic">Accessing personal records…</p>;

    return (
        <div className="max-w-lg mx-auto mt-10 p-8 bg-ivory-dark rounded-[2.5rem] shadow-2xl border border-racing-green/10 text-racing-green mb-20">
            <div className="flex justify-between items-center mb-8 border-b border-racing-green/10 pb-6">
                <h1 className="text-3xl font-serif font-black italic uppercase tracking-tighter">Edit Profile</h1>
                <Link href="/profile/me" className="text-[10px] font-black uppercase tracking-widest text-racing-green/40 hover:text-racing-green transition-all">Back to profile</Link>
            </div>

            {status && (
                <div className={`${statusClass} mb-8 text-[11px] uppercase tracking-widest font-black text-center p-4 rounded-xl shadow-inner`}>
                    {status}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username */}
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-50">Username</label>
                    <input className="w-full p-4 bg-ivory border border-racing-green/10 rounded-xl text-black font-bold focus:border-racing-green transition-all outline-none" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>

                {/* ADRESSE SEKTION */}
                <div className="p-6 bg-white/40 rounded-[1.5rem] border border-racing-green/5 space-y-4 shadow-sm">
                    <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-racing-green/40 mb-2">Shipping Details</h3>

                    <div className="flex gap-4">
                        <div className="flex-[3]">
                            <label className="block text-[9px] font-black uppercase mb-1 opacity-60">Street</label>
                            <input className="w-full p-3 bg-ivory border border-racing-green/10 rounded-lg text-black font-bold" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Main St" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-[9px] font-black uppercase mb-1 opacity-60">No.</label>
                            <input className="w-full p-3 bg-ivory border border-racing-green/10 rounded-lg text-black text-center font-bold" value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)} placeholder="42" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[9px] font-black uppercase mb-1 opacity-60">Zip Code</label>
                            <input className="w-full p-3 bg-ivory border border-racing-green/10 rounded-lg text-black font-bold" value={zip} onChange={(e) => setZip(e.target.value)} maxLength={4} placeholder="1234" />
                        </div>
                        <div>
                            <label className="block text-[9px] font-black uppercase mb-1 opacity-60">City</label>
                            <input className="w-full p-3 bg-ivory border border-racing-green/10 rounded-lg text-black font-bold" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Copenhagen" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-50">Country</label>
                        <input className="w-full p-4 bg-ivory border border-racing-green/10 rounded-xl text-black font-bold" value={country} onChange={(e) => setCountry(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-50">CVR (optional)</label>
                        <input className="w-full p-4 bg-ivory border border-racing-green/10 rounded-xl text-black font-bold font-mono" value={cvr} onChange={(e) => setCvr(e.target.value)} />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-50">Biography</label>
                    <textarea className="w-full p-4 bg-ivory border border-racing-green/10 rounded-xl h-28 text-black font-medium leading-relaxed" value={bio} onChange={(e) => setBio(e.target.value)} />
                </div>

                <button className="w-full bg-racing-green text-ivory py-5 rounded-2xl hover:bg-zinc-800 transition-all font-black uppercase text-[11px] tracking-[0.2em] shadow-xl">
                    Save changes
                </button>
            </form>

            {/* ⭐ DANGER ZONE */}
            <div className="mt-16 pt-8 border-t border-racing-green/10">
                <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle size={14} className="text-red-800" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-800">Danger Zone</h3>
                </div>

                <div className="bg-red-50 p-6 rounded-[1.5rem] border border-red-100 flex flex-col items-center gap-4">
                    <p className="text-[11px] text-red-900/60 italic text-center leading-relaxed">
                        Want to leave the vault? This will send a confirmation link to your email to permanently delete your account and all associated data.
                    </p>

                    {deleteMessage && (
                        <p className={`text-[10px] font-black uppercase tracking-widest text-center ${deleteMessage.includes('sent') ? 'text-green-700' : 'text-red-700'}`}>
                            {deleteMessage}
                        </p>
                    )}

                    <button
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="flex items-center gap-2 px-6 py-3 bg-red-800 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-900 transition-all disabled:opacity-50"
                    >
                        {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        {isDeleting ? "Processing..." : "Request Account Deletion"}
                    </button>
                </div>
            </div>
        </div>
    );
}