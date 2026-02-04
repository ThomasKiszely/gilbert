import { useEffect, useState } from "react";
import { api } from "../api/api";

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
                    setStatusClass("text-red-600");
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
                setStatusClass("text-red-600");
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

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
                setStatusClass("text-red-600");
                return;
            }

            // Upload avatar if selected
            if (avatarFile) {
                const formData = new FormData();
                formData.append("avatar", avatarFile);

                const uploadRes = await fetch("/api/users/me/avatar", {
                    method: "POST",
                    body: formData
                });

                const uploadJson = await uploadRes.json();
                if (!uploadJson.success) {
                    setStatus("Avatar upload failed");
                    setStatusClass("text-red-600");
                    return;
                }
            }

            setStatus("Profile updated");
            setStatusClass("text-green-600");

        } catch {
            setStatus("Server error");
            setStatusClass("text-red-600");
        }
    }

    if (loading) {
        return <p className="text-center mt-20">Loading profile…</p>;
    }

    return (
        <div className="max-w-lg mx-auto mt-20 p-6 bg-white rounded shadow">
            <h1 className="text-2xl font-semibold mb-4">Edit Profile</h1>

            {status && <p className={`${statusClass} mb-4`}>{status}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">

                <div>
                    <label>Username</label>
                    <input
                        className="input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div>
                    <label>City</label>
                    <input
                        className="input"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    />
                </div>

                <div>
                    <label>Country</label>
                    <input
                        className="input"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                    />
                </div>

                <div>
                    <label>CVR (optional)</label>
                    <input
                        className="input"
                        value={cvr}
                        onChange={(e) => setCvr(e.target.value)}
                    />
                </div>

                <div>
                    <label>Bio</label>
                    <textarea
                        className="input"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                    />
                </div>

                <div>
                    <label>Avatar</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setAvatarFile(file);
                            if (file) {
                                setAvatarPreview(URL.createObjectURL(file));
                            }
                        }}
                    />
                    <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="mt-2 max-w-[150px] rounded"
                    />
                </div>

                <div>
                    <label>Language</label>
                    <select
                        className="input"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                    >
                        <option value="da">Dansk</option>
                        <option value="en">English</option>
                    </select>
                </div>

                <button className="btn-primary w-full">Save changes</button>
            </form>
        </div>
    );
}
