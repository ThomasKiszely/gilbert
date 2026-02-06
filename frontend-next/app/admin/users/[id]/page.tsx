'use client'; // Nødvendigt pga. hooks

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/app/api/api";
import Link from "next/link";

export default function AdminUserEdit() {
    const params = useParams();
    const userId = params.id;

    const [user, setUser] = useState<any>(null);
    const [message, setMessage] = useState("");

    const [role, setRole] = useState("user");
    const [status, setStatus] = useState("none");
    const [badges, setBadges] = useState({
        isProfessional: false,
        isExpertSeller: false,
        isIdVerified: false
    });

    async function fetchUser() {
        try {
            const res = await api(`/api/admin/users/${userId}`);
            const data = await res.json();

            if (data?.data) {
                setUser(data.data);
                setRole(data.data.role);
                setStatus(data.data.professionalStatus);
                setBadges(data.data.badges);
            }
        } catch (err) {
            console.error("Could not fetch user", err);
        }
    }

    async function updateRole() {
        const res = await api(`/api/admin/users/${userId}/role`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role })
        });
        const data = await res.json();
        setUser(data.data);
        setMessage("Role updated!");
    }

    async function updateStatus() {
        const res = await api(`/api/admin/users/${userId}/professional`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ professionalStatus: status })
        });
        const data = await res.json();
        setUser(data.data);
        setMessage("Status updated!");
    }

    async function updateBadges() {
        const res = await api(`/api/admin/users/${userId}/badges`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ badges })
        });
        const data = await res.json();
        setUser(data.data);
        setMessage("Badges updated!");
    }

    useEffect(() => {
        if (userId) fetchUser();
    }, [userId]);

    if (!user) {
        return <p className="p-6 text-center text-ivory">Loading user…</p>;
    }

    return (
        <div className="max-w-3xl mx-auto p-6 text-ivory">
            <h1 className="text-3xl font-bold mb-4">Admin – Edit User</h1>

            <Link href="/admin/users" className="text-sm underline text-ivory/60 hover:text-ivory">
                ← Back to users
            </Link>

            <h2 className="text-2xl font-semibold mt-6">{user.username}</h2>

            {/* User Info Box - Forced text-black so we can see it on bg-gray-50 */}
            <div className="mt-4 space-y-2 p-4 bg-gray-50 rounded-lg text-black">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>Status:</strong> {user.professionalStatus}</p>
                <p>
                    <strong>Badges:</strong>{" "}
                    Professional: {user.badges?.isProfessional ? "✔" : "✘"},{" "}
                    Expert: {user.badges?.isExpertSeller ? "✔" : "✘"},{" "}
                    ID Verified: {user.badges?.isIdVerified ? "✔" : "✘"}
                </p>
            </div>

            <hr className="my-6 border-ivory/20" />

            {/* Update Role */}
            <h3 className="text-xl font-semibold">Update role</h3>
            <div className="flex gap-2 mt-2">
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="border p-2 rounded flex-1 bg-white text-black"
                >
                    <option value="user">User</option>
                    <option value="professional">Professional</option>
                    <option value="admin">Admin</option>
                </select>
                <button onClick={updateRole} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Update
                </button>
            </div>

            {/* Update Status */}
            <h3 className="text-xl font-semibold mt-6">Update professional status</h3>
            <div className="flex gap-2 mt-2">
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="border p-2 rounded flex-1 bg-white text-black"
                >
                    <option value="none">None</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
                <button onClick={updateStatus} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Update
                </button>
            </div>

            {/* Update Badges */}
            <h3 className="text-xl font-semibold mt-6">Update badges</h3>
            <div className="space-y-2 mt-2 p-4 border border-ivory/20 rounded">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={badges.isProfessional}
                        onChange={(e) => setBadges({ ...badges, isProfessional: e.target.checked })}
                    />
                    Professional
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={badges.isExpertSeller}
                        onChange={(e) => setBadges({ ...badges, isExpertSeller: e.target.checked })}
                    />
                    Expert Seller
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={badges.isIdVerified}
                        onChange={(e) => setBadges({ ...badges, isIdVerified: e.target.checked })}
                    />
                    ID Verified
                </label>
                <button onClick={updateBadges} className="w-full bg-blue-600 text-white px-4 py-2 rounded mt-2 hover:bg-blue-700">
                    Update badges
                </button>
            </div>

            {message && (
                <div className="mt-4 p-3 bg-green-600 text-white rounded font-semibold text-center">
                    {message}
                </div>
            )}
        </div>
    );
}