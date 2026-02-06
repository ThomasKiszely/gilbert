'use client';

import { useEffect, useState } from "react";
import { api } from "@/app/api/api";
import Link from "next/link";

export default function EditProfilePage() {
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("");
    const [statusClass, setStatusClass] = useState("");

    const [username, setUsername] = useState("");
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("");
    const [cvr, setCvr] = useState("");
    const [bio, setBio] = useState("");
    const [language, setLanguage] = useState("da");
    const [avatarPreview, setAvatarPreview] = useState("/avatars/Gilbert.jpeg");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    // Load profile on mount
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

        return () => {
            if (avatarPreview.startsWith("blob:")) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setStatus("Saving...");
        setStatusClass("bg-blue-600 text-white");

        const payload = {
            username,
            location: { city, country },
            cvr,
            profile: { bio, language }
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

                const uploadRes = await api("/api/users/me/avatar", {
                    method: "POST",
                    body: formData,
                    headers: { "Content-Type": "" }
                });

                const uploadJson = await uploadRes.json();
                if (!uploadJson.success) {
                    setStatus("Avatar upload failed");
                    setStatusClass("bg-red-600 text-white");
                    return;
                }
            }

            setStatus("Profile updated successfully");
            setStatusClass("bg-green-700 text-white");

        } catch {
            setStatus("Server error");
            setStatusClass("bg-red-600 text-white");
        }
    }

    if (loading) {
        return <p className="text-center mt-20 text-ivory">Loading profile…</p>;
    }

    return (

        <div className="max-w-lg mx-auto mt-10 p-8 bg-ivory-dark rounded-2xl shadow-2xl border border-racing-green/10 text-racing-green">
            <div className="flex justify-between items-center mb-8 border-b border-racing-green/10 pb-4">
                <h1 className="text-2xl font-serif font-bold uppercase tracking-tight">Edit Profile</h1>
                <Link href="/me" className="text-sm text-racing-green/60 underline hover:text-racing-green">Back to profile</Link>
            </div>

            {status && <p className={`${statusClass} mb-6 font-semibold text-center p-3 rounded-lg shadow-sm transition-all`}>{status}</p>}

            <form onSubmit={handleSubmit} className="space-y-5">

                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1">Username</label>
                    <input
                        className="w-full p-3 bg-ivory border border-racing-green/20 rounded-lg focus:ring-2 focus:ring-racing-green outline-none text-black"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1">City</label>
                        <input
                            className="w-full p-3 bg-ivory border border-racing-green/20 rounded-lg focus:ring-2 focus:ring-racing-green outline-none text-black"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1">Country</label>
                        <input
                            className="w-full p-3 bg-ivory border border-racing-green/20 rounded-lg focus:ring-2 focus:ring-racing-green outline-none text-black"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1">CVR (optional)</label>
                    <input
                        className="w-full p-3 bg-ivory border border-racing-green/20 rounded-lg focus:ring-2 focus:ring-racing-green outline-none text-black"
                        value={cvr}
                        onChange={(e) => setCvr(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1">Bio</label>
                    <textarea
                        className="w-full p-3 bg-ivory border border-racing-green/20 rounded-lg h-28 focus:ring-2 focus:ring-racing-green outline-none text-black"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                    />
                </div>

                {/* Avatar sektion med ivory-base baggrund for kontrast */}
                <div className="p-5 border border-dashed border-racing-green/30 rounded-xl bg-ivory/50">
                    <label className="block text-xs font-bold uppercase tracking-wider mb-3">Profile Picture</label>
                    <div className="flex items-center gap-6">
                        <img
                            src={avatarPreview}
                            alt="Avatar preview"
                            className="w-20 h-20 rounded-full object-cover border-4 border-ivory shadow-lg"
                        />
                        <input
                            type="file"
                            className="text-xs text-racing-green/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-racing-green file:text-ivory hover:file:bg-racing-green-light cursor-pointer"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setAvatarFile(file);
                                if (file) {
                                    setAvatarPreview(URL.createObjectURL(file));
                                }
                            }}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1">Language</label>
                    <select
                        className="w-full p-3 bg-ivory border border-racing-green/20 rounded-lg focus:ring-2 focus:ring-racing-green outline-none text-black"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                    >
                        <option value="da">Dansk</option>
                        <option value="en">English</option>
                    </select>
                </div>

                <button className="w-full bg-racing-green text-ivory py-4 rounded-xl hover:bg-racing-green-dark transition-all font-bold uppercase tracking-widest shadow-lg active:scale-[0.98]">
                    Save changes
                </button>
            </form>
        </div>
    );
}