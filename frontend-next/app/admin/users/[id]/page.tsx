'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/app/api/api";
import Link from "next/link";

export default function AdminUserEdit() {
    const params = useParams();
    const userId = params.id;

    const [user, setUser] = useState<any>(null);
    const [message, setMessage] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [suspensionReason, setSuspensionReason] = useState("");
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
                setStatus(data.data.professionalStatus || "none");
                setBadges(data.data.badges || { isProfessional: false, isExpertSeller: false, isIdVerified: false });
                setSuspensionReason(data.data.suspensionReason || "");
            }
        } catch (err) {
            console.error("Could not fetch user", err);
        }
    }

    function showMessage(msg: string) {
        setMessage(msg);
        setTimeout(() => setMessage(""), 3000);
    }

    async function handleToggleSuspension() {
        const isBanning = !user.isSuspended;
        if (isBanning && !suspensionReason.trim()) {
            alert("Please provide a reason for the suspension.");
            return;
        }
        try {
            const res = await api(`/api/admin/users/${userId}/suspension`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isSuspended: isBanning, reason: suspensionReason })
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data.data);
                setIsModalOpen(false);
                showMessage(isBanning ? "User suspended!" : "User reinstated!");
            }
        } catch (err) {
            console.error("Suspension error", err);
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
        showMessage("Role updated!");
    }

    async function updateStatus(newStatus?: string) {
        const targetStatus = newStatus || status;
        const res = await api(`/api/admin/users/${userId}/professional`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ professionalStatus: targetStatus })
        });
        const data = await res.json();
        setUser(data.data);
        setStatus(data.data.professionalStatus);
        showMessage("Status updated!");
    }

    async function updateBadges() {
        const res = await api(`/api/admin/users/${userId}/badges`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ badges })
        });
        const data = await res.json();
        setUser(data.data);
        showMessage("Badges updated!");
    }

    useEffect(() => {
        if (userId) fetchUser();
    }, [userId]);

    if (!user) return <p className="p-6 text-center text-ivory">Loading user…</p>;

    return (
        <div className="max-w-3xl mx-auto p-6 text-ivory">
            <h1 className="text-3xl font-bold mb-4">Admin – Edit User</h1>
            <Link href="/admin/users" className="text-sm underline text-ivory/60 hover:text-ivory">← Back to users</Link>

            <div className="flex items-center justify-between mt-6">
                <h2 className="text-2xl font-semibold">{user.username}</h2>
                {user.isSuspended && <span className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">Suspended</span>}
            </div>

            <div className="mt-4 space-y-2 p-4 bg-gray-50 rounded-lg text-black">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>CVR:</strong> {user.cvr || "Not provided"}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>Status:</strong> {user.professionalStatus}</p>
                {user.isSuspended && <p className="text-red-600"><strong>Reason:</strong> {user.suspensionReason}</p>}
                <p><strong>Badges:</strong> Professional: {user.badges?.isProfessional ? "✔" : "✘"}, Expert: {user.badges?.isExpertSeller ? "✔" : "✘"}, ID Verified: {user.badges?.isIdVerified ? "✔" : "✘"}</p>
            </div>

            {/* ⭐ Hurtig-knap til godkendelse */}
            {status === 'pending' && (
                <div className="mt-6 p-4 bg-yellow-100 border border-yellow-300 rounded-lg text-black">
                    <p className="mb-2">Denne bruger afventer godkendelse af CVR: <strong>{user.cvr}</strong></p>
                    <button onClick={() => updateStatus("approved")} className="w-full bg-racing-green text-white py-2 rounded font-bold hover:bg-green-700">
                        Godkend CVR nu
                    </button>
                </div>
            )}

            <hr className="my-6 border-ivory/20" />

            <h3 className="text-xl font-semibold">Update role</h3>
            <div className="flex gap-2 mt-2">
                <select value={role} onChange={(e) => setRole(e.target.value)} className="border p-2 rounded flex-1 bg-white text-black">
                    <option value="user">User</option>
                    <option value="professional">Professional</option>
                    <option value="admin">Admin</option>
                </select>
                <button onClick={updateRole} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Update</button>
            </div>

            <h3 className="text-xl font-semibold mt-6">Update professional status</h3>
            <div className="flex gap-2 mt-2">
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="border p-2 rounded flex-1 bg-white text-black">
                    <option value="none">None</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
                <button onClick={() => updateStatus()} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Update</button>
            </div>

            <h3 className="text-xl font-semibold mt-6">Update badges</h3>
            <div className="space-y-2 mt-2 p-4 border border-ivory/20 rounded">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={badges.isProfessional} onChange={(e) => setBadges({ ...badges, isProfessional: e.target.checked })} /> Professional</label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={badges.isExpertSeller} onChange={(e) => setBadges({ ...badges, isExpertSeller: e.target.checked })} /> Expert Seller</label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={badges.isIdVerified} onChange={(e) => setBadges({ ...badges, isIdVerified: e.target.checked })} /> ID Verified</label>
                <button onClick={updateBadges} className="w-full bg-blue-600 text-white px-4 py-2 rounded mt-2 hover:bg-blue-700">Update badges</button>
            </div>

            <hr className="my-10 border-red-500/30" />
            <h3 className="text-xl font-semibold text-red-500">Danger Zone</h3>
            <div className="mt-4 p-4 border border-red-500/30 rounded-lg bg-red-500/5">
                <button onClick={() => setIsModalOpen(true)} className={`w-full py-2 rounded font-bold text-white ${user.isSuspended ? "bg-green-700 hover:bg-green-600" : "bg-red-700 hover:bg-red-600"}`}>
                    {user.isSuspended ? "Unban / Reinstate User" : "Ban / Suspend User"}
                </button>
            </div>

            {message && <div className="mt-4 p-3 bg-green-600 text-white rounded font-semibold text-center">{message}</div>}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
                    <div className="bg-white text-black p-6 rounded-xl max-w-md w-full shadow-2xl">
                        <h3 className="text-xl font-bold mb-4">{user.isSuspended ? "Confirm Unban" : "Provide Reason"}</h3>
                        {!user.isSuspended && <textarea className="w-full border p-3 rounded-lg mb-4" placeholder="Reason..." value={suspensionReason} onChange={(e) => setSuspensionReason(e.target.value)} rows={4} />}
                        <div className="flex gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-gray-200 rounded">Cancel</button>
                            <button onClick={handleToggleSuspension} className={`flex-1 py-2 text-white rounded ${user.isSuspended ? "bg-green-700" : "bg-red-700"}`}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}