import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function AdminUserEdit() {
    const [params] = useSearchParams();
    const userId = params.get("id");

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
            const res = await fetch(`/api/admin/users/${userId}`, {
                credentials: "include"
            });

            const data = await res.json();
            setUser(data.data);

            setRole(data.data.role);
            setStatus(data.data.professionalStatus);
            setBadges(data.data.badges);

        } catch (err) {
            console.error("Could not fetch user", err);
        }
    }

    async function updateRole() {
        const res = await fetch(`/api/admin/users/${userId}/role`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role })
        });

        const data = await res.json();
        setUser(data.data);
        setMessage("Role updated!");
    }

    async function updateStatus() {
        const res = await fetch(`/api/admin/users/${userId}/professional`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ professionalStatus: status })
        });

        const data = await res.json();
        setUser(data.data);
        setMessage("Status updated!");
    }

    async function updateBadges() {
        const res = await fetch(`/api/admin/users/${userId}/badges`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ badges })
        });

        const data = await res.json();
        setUser(data.data);
        setMessage("Badges updated!");
    }

    useEffect(() => {
        fetchUser();
    }, []);

    if (!user) {
        return <p className="p-6">Loading user…</p>;
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">Admin – Edit User</h1>

            <a href="/admin/users" className="text-sm underline text-muted-foreground">
                ← Back to users
            </a>

            <h2 className="text-2xl font-semibold mt-6">{user.username}</h2>

            <div className="mt-4 space-y-2">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>Status:</strong> {user.professionalStatus}</p>
                <p>
                    <strong>Badges:</strong>{" "}
                    Professional: {user.badges.isProfessional ? "✔" : "✘"},{" "}
                    Expert: {user.badges.isExpertSeller ? "✔" : "✘"},{" "}
                    ID Verified: {user.badges.isIdVerified ? "✔" : "✘"}
                </p>
            </div>

            <hr className="my-6" />

            {/* Update Role */}
            <h3 className="text-xl font-semibold">Update role</h3>
            <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="input mt-2"
            >
                <option value="user">User</option>
                <option value="professional">Professional</option>
                <option value="admin">Admin</option>
            </select>

            <button
                onClick={updateRole}
                className="btn-primary mt-2"
            >
                Update role
            </button>

            {/* Update Status */}
            <h3 className="text-xl font-semibold mt-6">Update professional status</h3>
            <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="input mt-2"
            >
                <option value="none">None</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
            </select>

            <button
                onClick={updateStatus}
                className="btn-primary mt-2"
            >
                Update status
            </button>

            {/* Update Badges */}
            <h3 className="text-xl font-semibold mt-6">Update badges</h3>

            <div className="space-y-2 mt-2">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={badges.isProfessional}
                        onChange={(e) =>
                            setBadges({ ...badges, isProfessional: e.target.checked })
                        }
                    />
                    Professional
                </label>

                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={badges.isExpertSeller}
                        onChange={(e) =>
                            setBadges({ ...badges, isExpertSeller: e.target.checked })
                        }
                    />
                    Expert Seller
                </label>

                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={badges.isIdVerified}
                        onChange={(e) =>
                            setBadges({ ...badges, isIdVerified: e.target.checked })
                        }
                    />
                    ID Verified
                </label>
            </div>

            <button
                onClick={updateBadges}
                className="btn-primary mt-2"
            >
                Update badges
            </button>

            {message && (
                <p className="mt-4 text-green-500 font-semibold">{message}</p>
            )}
        </div>
    );
}
